import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { ensureRoom, startRoomRecording } from '@/lib/livekit'

/**
 * Move users into a target room. Closes any currently-open memberships for
 * these users (enforcing the one-open-membership-per-user invariant), then
 * upserts their membership on the target room. Idempotent per user.
 */
export async function moveUsersToRoom(
  admin: SupabaseClient,
  userIds: string[],
  targetRoomId: string,
  role: 'participant' | 'host' = 'participant'
) {
  if (userIds.length === 0) return
  const now = new Date().toISOString()

  await admin
    .from('neighbors_room_members')
    .update({ left_at: now })
    .in('user_id', userIds)
    .is('left_at', null)

  await admin.from('neighbors_room_members').upsert(
    userIds.map((uid) => ({
      room_id: targetRoomId,
      user_id: uid,
      joined_at: now,
      left_at: null,
      role,
    })),
    { onConflict: 'room_id,user_id' }
  )
}

/**
 * Authorize the caller as either a global admin or the event's host.
 * Returns null if authorized; otherwise returns a tuple to short-circuit with.
 */
export async function requireEventHost(
  eventId: string
): Promise<{ admin: SupabaseClient; userId: string } | Response> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) {
    return { admin: createAdminClient(), userId: user.id }
  }

  const admin = createAdminClient()
  const { data: event } = await admin
    .from('neighbors_events')
    .select('host_id')
    .eq('id', eventId)
    .single()

  if (event?.host_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  return { admin, userId: user.id }
}

/**
 * Idempotently provision the event's main room: creates the neighbors_rooms
 * row, creates the LiveKit room (with a long empty-timeout so it survives
 * everyone being in breakouts), and starts main-room egress if none is
 * already running. Returns the main room's livekit_room_name.
 */
export async function ensureMainRoom(
  admin: SupabaseClient,
  eventId: string
): Promise<string> {
  const { data: existing } = await admin
    .from('neighbors_rooms')
    .select('id, livekit_room_name')
    .eq('event_id', eventId)
    .eq('room_type', 'main')
    .maybeSingle()

  let roomId = existing?.id as string | undefined
  let roomName = existing?.livekit_room_name as string | undefined

  if (!existing) {
    roomName = `event-${eventId}-main`
    const { data: inserted, error } = await admin
      .from('neighbors_rooms')
      .insert({
        event_id: eventId,
        round_id: null,
        room_type: 'main',
        livekit_room_name: roomName,
      })
      .select('id')
      .single()
    if (error || !inserted) throw new Error(error?.message || 'Failed to create main room')
    roomId = inserted.id
  }

  const { data: active } = await admin
    .from('neighbors_recordings')
    .select('id')
    .eq('room_id', roomId!)
    .in('transcription_status', ['pending', 'processing'])
    .maybeSingle()

  if (!active) {
    try {
      await ensureRoom(roomName!)
      const recording = await startRoomRecording(roomName!, roomId!)
      await admin.from('neighbors_recordings').insert({
        room_id: roomId,
        egress_id: recording.egressId,
        storage_url: recording.storageUrl,
        transcription_status: 'pending',
      })
    } catch (err) {
      console.error(`Failed to start main-room recording for event ${eventId}:`, err)
    }
  }

  return roomName!
}
