import { NextResponse } from 'next/server'
import { breakoutLogServer, breakoutLogServerError } from '@/lib/breakout-debug-log'
import { deleteLiveKitRoom, stopRoomRecording } from '@/lib/livekit'
import { moveUsersToRoom, requireEventHost } from '@/lib/rooms'
import { logEvent } from '@/lib/pipeline-logger'

// Pull every participant back to the main room. Ends any active round as a
// side effect (stopping its egresses) and also evacuates ad-hoc rooms.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventHost(params.id)
  if (auth instanceof Response) return auth
  const { admin } = auth
  breakoutLogServer('return-to-main', 'start', 'host return all', { eventId: params.id })

  const endedAt = new Date().toISOString()

  const { data: event } = await admin
    .from('neighbors_events')
    .select('host_id')
    .eq('id', params.id)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  // End any active round. Use a status-guarded UPDATE so a concurrent caller
  // doesn't double-end (matches round-end route's idempotency pattern).
  const { data: endedRounds } = await admin
    .from('neighbors_rounds')
    .update({ status: 'completed', ended_at: endedAt })
    .eq('event_id', params.id)
    .eq('status', 'active')
    .select('id')

  if (endedRounds?.length) {
    breakoutLogServer('return-to-main', 'end_active_rounds', 'ended', {
      eventId: params.id,
      roundIds: endedRounds.map((r) => r.id),
    })
    const roundIds = endedRounds.map((r) => r.id)
    const { data: recordings } = await admin
      .from('neighbors_recordings')
      .select('egress_id, neighbors_rooms!inner(round_id)')
      .in('neighbors_rooms.round_id', roundIds)
      .eq('transcription_status', 'pending')

    for (const recording of recordings || []) {
      if (recording.egress_id) {
        try {
          await stopRoomRecording(recording.egress_id)
        } catch (err) {
          breakoutLogServerError('return-to-main', 'egress_stop_failed', err, {
            eventId: params.id,
            egress_id: recording.egress_id,
          })
          console.error(`Failed to stop egress ${recording.egress_id}:`, err)
          await logEvent({
            pipeline: 'livekit.egress.stop',
            entityType: 'recording',
            error: err,
            metadata: {
              event_id: params.id,
              egress_id: recording.egress_id,
              triggered_by: 'return_to_main',
            },
          })
        }
      }
    }

    // Tear down the LiveKit breakout rooms tied to the ended rounds.
    const { data: breakoutRooms } = await admin
      .from('neighbors_rooms')
      .select('id, livekit_room_name')
      .in('round_id', roundIds)
      .eq('room_type', 'breakout')

    if (breakoutRooms?.length) {
      await Promise.all(
        breakoutRooms.map(async (r) => {
          try {
            await deleteLiveKitRoom(r.livekit_room_name)
          } catch (err) {
            breakoutLogServerError('return-to-main', 'livekit_delete_failed', err, {
              eventId: params.id,
              roomId: r.id,
              livekitRoomName: r.livekit_room_name,
            })
          }
        })
      )
    }
  }

  // Find everyone currently in a non-main room for this event.
  const { data: stragglers } = await admin
    .from('neighbors_room_members')
    .select('user_id, neighbors_rooms!inner(event_id, room_type)')
    .eq('neighbors_rooms.event_id', params.id)
    .neq('neighbors_rooms.room_type', 'main')
    .is('left_at', null)

  const userIds = [...new Set((stragglers || []).map((m) => m.user_id))]
  if (userIds.length === 0) {
    breakoutLogServer('return-to-main', 'no_stragglers', 'everyone on main or empty', { eventId: params.id })
    return NextResponse.json({ ok: true, moved: 0 })
  }
  breakoutLogServer('return-to-main', 'stragglers', 'moving to main', {
    eventId: params.id,
    userCount: userIds.length,
    userIds,
  })

  const { data: mainRoom } = await admin
    .from('neighbors_rooms')
    .select('id')
    .eq('event_id', params.id)
    .eq('room_type', 'main')
    .single()

  if (!mainRoom) {
    return NextResponse.json({ error: 'Main room not found' }, { status: 500 })
  }

  // Host gets role='host' in main; everyone else 'participant'.
  const hostInGroup = userIds.includes(event.host_id)
  const nonHosts = userIds.filter((id) => id !== event.host_id)
  await moveUsersToRoom(admin, nonHosts, mainRoom.id, 'participant')
  if (hostInGroup) {
    await moveUsersToRoom(admin, [event.host_id], mainRoom.id, 'host')
  }

  breakoutLogServer('return-to-main', 'complete', 'ok', { eventId: params.id, moved: userIds.length })
  return NextResponse.json({ ok: true, moved: userIds.length })
}
