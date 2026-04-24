import { NextResponse } from 'next/server'
import { breakoutLogServer, breakoutLogServerError } from '@/lib/breakout-debug-log'
import { startRoomRecording } from '@/lib/livekit'
import { requireEventHost } from '@/lib/rooms'
import { logEvent } from '@/lib/pipeline-logger'

const DEFAULT_DURATION_SECONDS = 300

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventHost(params.id)
  if (auth instanceof Response) return auth
  const { admin, userId } = auth
  breakoutLogServer('pair-everyone', 'start', 'host pairing', { eventId: params.id, userId })

  const body = await request.json().catch(() => ({}))
  const prompt: string | null =
    typeof body?.prompt === 'string' && body.prompt.trim().length > 0
      ? body.prompt.trim()
      : null
  const durationSeconds: number =
    typeof body?.durationSeconds === 'number' && body.durationSeconds > 0
      ? Math.floor(body.durationSeconds)
      : DEFAULT_DURATION_SECONDS

  const { data: alreadyActive } = await admin
    .from('neighbors_rounds')
    .select('id')
    .eq('event_id', params.id)
    .eq('status', 'active')
    .maybeSingle()

  if (alreadyActive) {
    breakoutLogServer('pair-everyone', 'blocked', 'round already active', {
      eventId: params.id,
      activeRoundId: alreadyActive.id,
    })
    return NextResponse.json(
      { error: 'A round is already active — Return All first' },
      { status: 409 }
    )
  }

  const { data: participants } = await admin
    .from('neighbors_event_participants')
    .select('user_id')
    .eq('event_id', params.id)

  // Exclude the caller (the host running the controls) — they stay in main
  // to observe. Edge case: a global admin who isn't the event host still gets
  // excluded here if they're the one clicking, which is the intent.
  const pairableUserIds = (participants || [])
    .map((p) => p.user_id)
    .filter((id) => id !== userId)

  if (pairableUserIds.length < 2) {
    breakoutLogServer('pair-everyone', 'not_enough', 'need 2+ pairable', {
      eventId: params.id,
      pairableCount: pairableUserIds.length,
    })
    return NextResponse.json(
      { error: 'Need at least 2 other participants to pair' },
      { status: 400 }
    )
  }

  const pairs = createRandomPairs(pairableUserIds)
  breakoutLogServer('pair-everyone', 'assignments', 'random pairs', {
    eventId: params.id,
    pairCount: pairs.length,
    groups: pairs.map((p) => ({ n: p.userIds.length, userIds: p.userIds })),
  })

  const { data: lastRound } = await admin
    .from('neighbors_rounds')
    .select('round_number')
    .eq('event_id', params.id)
    .order('round_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextRoundNumber = (lastRound?.round_number ?? 0) + 1
  const startedAt = new Date()
  const endsAt = new Date(startedAt.getTime() + durationSeconds * 1000)

  const { data: round, error: roundError } = await admin
    .from('neighbors_rounds')
    .insert({
      event_id: params.id,
      round_number: nextRoundNumber,
      round_type: 'random',
      duration_seconds: durationSeconds,
      prompt,
      status: 'active',
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single()

  if (roundError || !round) {
    breakoutLogServer('pair-everyone', 'round_insert_failed', 'db', {
      eventId: params.id,
      err: roundError?.message,
    })
    return NextResponse.json(
      { error: roundError?.message || 'Failed to create round' },
      { status: 500 }
    )
  }
  breakoutLogServer('pair-everyone', 'round_created', 'ok', {
    eventId: params.id,
    roundId: round.id,
    durationSeconds: round.duration_seconds,
  })

  const allAssignedUsers = pairs.flatMap((p) => p.userIds)
  if (allAssignedUsers.length > 0) {
    await admin
      .from('neighbors_room_members')
      .update({ left_at: startedAt.toISOString() })
      .in('user_id', allAssignedUsers)
      .is('left_at', null)
    breakoutLogServer('pair-everyone', 'cleared_old_memberships', 'pairable users', {
      eventId: params.id,
      userCount: allAssignedUsers.length,
    })
  }

  // Phase 1: bulk-insert all breakout rows first. Keeps all room INSERT
  // realtime events within a single tick so the client sees every room in
  // one refetch cycle. Previously we inserted + started egress per room
  // sequentially, which spread INSERTs over ~4s and realtime missed later
  // events.
  const baseTs = Date.now()
  const roomsToInsert = pairs.map((pair, i) => ({
    event_id: params.id,
    round_id: round.id,
    room_type: 'breakout' as const,
    livekit_room_name: `breakout-${round.id}-${baseTs}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    topic: null,
    __userIds: pair.userIds, // stripped before insert
  }))
  const { data: insertedRooms, error: roomsError } = await admin
    .from('neighbors_rooms')
    .insert(roomsToInsert.map(({ __userIds, ...r }) => r))
    .select()

  if (roomsError || !insertedRooms?.length) {
    breakoutLogServerError('pair-everyone', 'rooms_insert_failed', roomsError, {
      eventId: params.id,
      roundId: round.id,
    })
    return NextResponse.json(
      { error: roomsError?.message || 'Failed to create breakout rooms' },
      { status: 500 }
    )
  }

  // Pair inserted rows back to their assignments. Insert order matches
  // our input order, so we can zip by index.
  const pairedRooms = insertedRooms.map((room, i) => ({
    ...room,
    userIds: roomsToInsert[i].__userIds,
  }))

  // Phase 2: bulk-upsert all memberships across every breakout.
  const memberRows = pairedRooms.flatMap((r) =>
    r.userIds.map((uid: string) => ({
      room_id: r.id,
      user_id: uid,
      joined_at: startedAt.toISOString(),
      left_at: null,
      role: 'participant' as const,
    }))
  )
  const { error: membersError } = await admin
    .from('neighbors_room_members')
    .upsert(memberRows, { onConflict: 'room_id,user_id' })

  if (membersError) {
    breakoutLogServerError('pair-everyone', 'members_upsert_failed', membersError, {
      eventId: params.id,
      roundId: round.id,
      memberRowCount: memberRows.length,
    })
  }

  for (const r of pairedRooms) {
    breakoutLogServer('pair-everyone', 'breakout_row', 'room + members', {
      eventId: params.id,
      roundId: round.id,
      roomId: r.id,
      livekitRoomName: r.livekit_room_name,
      memberUserIds: r.userIds,
    })
  }

  // Phase 3: start all egresses in parallel. A failure on one doesn't
  // block the rest.
  await Promise.all(
    pairedRooms.map(async (r) => {
      try {
        const recording = await startRoomRecording(r.livekit_room_name, r.id)
        await admin.from('neighbors_recordings').insert({
          room_id: r.id,
          egress_id: recording.egressId,
          storage_url: recording.storageUrl,
          transcription_status: 'pending',
        })
        await logEvent({
          pipeline: 'livekit.egress.start',
          entityId: r.id,
          entityType: 'room',
          userId,
          metadata: {
            event_id: params.id,
            round_id: round.id,
            egress_id: recording.egressId,
            room_name: r.livekit_room_name,
            source: 'pair-everyone',
          },
        })
      } catch (err) {
        breakoutLogServerError('pair-everyone', 'egress_start_failed', err, {
          eventId: params.id,
          roomId: r.id,
          livekitRoomName: r.livekit_room_name,
        })
        await logEvent({
          pipeline: 'livekit.egress.start',
          entityId: r.id,
          entityType: 'room',
          userId,
          error: err,
          metadata: {
            event_id: params.id,
            round_id: round.id,
            room_name: r.livekit_room_name,
            source: 'pair-everyone',
          },
        })
      }
    })
  )

  const createdRooms = pairedRooms.map((r) => ({
    id: r.id,
    event_id: r.event_id,
    round_id: r.round_id,
    room_type: r.room_type,
    livekit_room_name: r.livekit_room_name,
    topic: r.topic,
    members: r.userIds,
  }))

  breakoutLogServer('pair-everyone', 'complete', 'response', {
    eventId: params.id,
    roundId: round.id,
    createdCount: createdRooms.length,
    roomIds: createdRooms.map((r) => r.id),
  })
  return NextResponse.json({ round, rooms: createdRooms })
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function createRandomPairs(userIds: string[]) {
  const shuffled = fisherYatesShuffle(userIds)
  const pairs: { userIds: string[] }[] = []

  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      pairs.push({ userIds: [shuffled[i], shuffled[i + 1]] })
    } else if (pairs.length > 0) {
      pairs[pairs.length - 1].userIds.push(shuffled[i])
    } else {
      pairs.push({ userIds: [shuffled[i]] })
    }
  }

  return pairs
}
