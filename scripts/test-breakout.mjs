// Spawns N fake live participants in an event for manual testing. Each one is
// a real Supabase auth user, RSVP'd into the event and placed in the main
// room. Each bot runs `lk room join --publish-demo` so it appears as a live
// video tile you can see and interact with.
//
// Subscribes to realtime membership changes — when you dispatch a round or
// drag a bot into a breakout from the admin UI, the bot's `lk` subprocess
// restarts in the new room automatically.
//
// Press Ctrl+C to disconnect all bots and delete them.
//
// Usage:
//   node --env-file=.env.local scripts/test-breakout.mjs --event-id <uuid> [--users 3] [--verbose]
//
// The event must already be 'live' (start it from the admin dashboard first).

import { createClient } from '@supabase/supabase-js'
import { spawn } from 'node:child_process'

const args = parseArgs(process.argv.slice(2))
if (!args['event-id']) die('Missing --event-id')

const EVENT_ID = args['event-id']
const USER_COUNT = Number(args.users ?? 3)
const VERBOSE = Boolean(args.verbose)

const SUPABASE_URL = reqEnv('NEXT_PUBLIC_SUPABASE_URL')
const SERVICE_ROLE_KEY = reqEnv('SUPABASE_SERVICE_ROLE_KEY')
const LK_URL = reqEnv('NEXT_PUBLIC_LIVEKIT_URL')
const LK_API_KEY = reqEnv('LIVEKIT_API_KEY')
const LK_API_SECRET = reqEnv('LIVEKIT_API_SECRET')

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } },
})

const bots = [] // { id, email, password, currentRoom, proc, channel }
const reconcileTimers = new Map()
let shuttingDown = false

async function main() {
  const { data: event, error: eventErr } = await admin
    .from('neighbors_events')
    .select('id, title, status')
    .eq('id', EVENT_ID)
    .single()
  if (eventErr || !event) die(`Event not found: ${EVENT_ID}`)
  if (event.status !== 'live') {
    log(`  warning: event.status is '${event.status}' (not 'live'). Start the event first if main room isn't provisioned.`)
  }

  const { data: mainRoom, error: mainErr } = await admin
    .from('neighbors_rooms')
    .select('id, livekit_room_name')
    .eq('event_id', EVENT_ID)
    .eq('room_type', 'main')
    .maybeSingle()
  if (mainErr || !mainRoom) die(`Event has no main room yet — click "Start event" in the admin dashboard first.`)

  log(`> Spawning ${USER_COUNT} live test bots in "${event.title}"`)
  const tag = Date.now().toString(36)

  for (let i = 0; i < USER_COUNT; i++) {
    const email = `test-bot-${tag}-${i}@neighbors-test.local`
    const password = `TestBot!${tag}`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: `Test Bot ${i + 1}` },
    })
    if (error) throw new Error(`Create user ${email} failed: ${error.message}`)
    bots.push({
      id: data.user.id,
      email,
      displayName: `Test Bot ${i + 1}`,
      currentRoom: null,
      proc: null,
      channel: null,
    })
  }

  {
    const { error } = await admin.from('neighbors_event_participants').upsert(
      bots.map((b) => ({ event_id: EVENT_ID, user_id: b.id })),
      { onConflict: 'event_id,user_id' }
    )
    if (error) throw error
  }

  const now = new Date().toISOString()
  {
    const { error } = await admin.from('neighbors_room_members').upsert(
      bots.map((b) => ({
        room_id: mainRoom.id,
        user_id: b.id,
        joined_at: now,
        left_at: null,
        role: 'participant',
      })),
      { onConflict: 'room_id,user_id' }
    )
    if (error) throw error
  }

  for (const b of bots) spawnLk(b, mainRoom.livekit_room_name)

  for (const bot of bots) {
    bot.channel = admin
      .channel(`bot-${bot.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'neighbors_room_members',
          filter: `user_id=eq.${bot.id}`,
        },
        () => debouncedReconcile(bot)
      )
      .subscribe()
  }

  log(`\nReady. ${bots.length} bot(s) in main room "${mainRoom.livekit_room_name}":`)
  for (const b of bots) log(`  ${short(b.id)}  ${b.displayName}  <${b.email}>`)
  log(`\nDispatch rounds, drag bots into breakouts, return-to-main — they'll follow via realtime.`)
  log(`Press Ctrl+C to disconnect and delete them.\n`)

  await waitForSigint()
}

function debouncedReconcile(bot) {
  clearTimeout(reconcileTimers.get(bot.id))
  reconcileTimers.set(
    bot.id,
    setTimeout(() => reconcile(bot), 300)
  )
}

async function reconcile(bot) {
  if (shuttingDown) return
  const { data, error } = await admin
    .from('neighbors_room_members')
    .select('neighbors_rooms!inner(livekit_room_name, event_id, room_type)')
    .eq('user_id', bot.id)
    .eq('neighbors_rooms.event_id', EVENT_ID)
    .is('left_at', null)
    .maybeSingle()
  if (error) {
    verbose(`  ${short(bot.id)}: reconcile query failed: ${error.message}`)
    return
  }
  const targetRoom = data?.neighbors_rooms?.livekit_room_name
  if (!targetRoom) {
    // Transient — between closing old membership and upserting new. Ignore;
    // a subsequent event will carry the new assignment.
    verbose(`  ${short(bot.id)}: no open membership, holding in ${bot.currentRoom}`)
    return
  }
  if (bot.currentRoom === targetRoom) return
  log(`  ${short(bot.id)}: ${bot.currentRoom ?? '(none)'} -> ${targetRoom}`)
  killLk(bot)
  spawnLk(bot, targetRoom)
}

function spawnLk(bot, roomName) {
  bot.currentRoom = roomName
  const proc = spawn(
    '/opt/homebrew/bin/lk',
    ['room', 'join', '--identity', bot.id, '--publish-demo', roomName],
    {
      stdio: ['ignore', VERBOSE ? 'inherit' : 'ignore', VERBOSE ? 'inherit' : 'ignore'],
      env: {
        ...process.env,
        LIVEKIT_URL: LK_URL,
        LIVEKIT_API_KEY: LK_API_KEY,
        LIVEKIT_API_SECRET: LK_API_SECRET,
      },
    }
  )
  proc.on('error', (e) => console.error(`  ${short(bot.id)} spawn error: ${e.message}`))
  proc.on('exit', (code, sig) => {
    if (!shuttingDown && bot.proc === proc) {
      verbose(`  ${short(bot.id)}: lk exited (code=${code}, sig=${sig}) from ${roomName}`)
    }
  })
  bot.proc = proc
}

function killLk(bot) {
  if (bot.proc && !bot.proc.killed) {
    try { bot.proc.kill('SIGTERM') } catch {}
  }
  bot.proc = null
}

async function cleanup() {
  shuttingDown = true
  log(`\n- Cleaning up`)
  for (const t of reconcileTimers.values()) clearTimeout(t)
  for (const bot of bots) killLk(bot)
  for (const bot of bots) {
    if (bot.channel) { try { await admin.removeChannel(bot.channel) } catch {} }
  }
  await sleep(300)
  for (const bot of bots) {
    if (!bot.id) continue
    try {
      await admin.auth.admin.deleteUser(bot.id)
    } catch (e) {
      console.error(`  failed to delete ${bot.email}: ${e.message}`)
    }
  }
  log(`  deleted ${bots.length} bot(s)`)
}

function waitForSigint() {
  return new Promise((resolve) => {
    process.once('SIGINT', () => {
      log(`\n  Ctrl+C received`)
      resolve()
    })
  })
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next != null && !next.startsWith('--')) {
      out[key] = next
      i++
    } else {
      out[key] = true
    }
  }
  return out
}

function reqEnv(name) {
  const v = process.env[name]
  if (!v) die(`Missing env var: ${name} (run via: node --env-file=.env.local scripts/test-breakout.mjs ...)`)
  return v
}

function die(msg) { console.error(`ERROR: ${msg}`); process.exit(1) }
function log(...a) { console.log(...a) }
function verbose(...a) { if (VERBOSE) console.log(...a) }
function short(id) { return id?.slice(0, 8) ?? '?' }
function sleep(ms) { return new Promise((res) => setTimeout(res, ms)) }

main()
  .then(() => cleanup().then(() => process.exit(0)))
  .catch(async (err) => {
    console.error(`\nFAIL: ${err.message}`)
    if (VERBOSE && err.stack) console.error(err.stack)
    await cleanup().catch(() => {})
    process.exit(1)
  })
