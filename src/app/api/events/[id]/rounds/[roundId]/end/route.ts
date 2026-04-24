import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { breakoutLogServer, breakoutLogServerError } from '@/lib/breakout-debug-log'
import { deleteLiveKitRoom, stopRoomRecording } from '@/lib/livekit'
import { logEvent } from '@/lib/pipeline-logger'

export async function POST(
  request: Request,
  { params }: { params: { id: string; roundId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    breakoutLogServer('round-end', 'unauthorized', 'POST', { eventId: params.id, roundId: params.roundId })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  breakoutLogServer('round-end', 'start', 'end round', {
    eventId: params.id,
    roundId: params.roundId,
    userId: user.id,
  })

  const admin = createAdminClient()

  const { data: round } = await admin
    .from('neighbors_rounds')
    .select('id, status, ends_at')
    .eq('id', params.roundId)
    .eq('event_id', params.id)
    .single()

  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })

  // Idempotent — the client timer fires this alongside an admin button press.
  if (round.status === 'completed') {
    breakoutLogServer('round-end', 'idempotent', 'already completed', { eventId: params.id, roundId: params.roundId })
    return NextResponse.json({ ok: true, alreadyEnded: true })
  }
  if (round.status !== 'active') {
    breakoutLogServer('round-end', 'not_active', 'bad state', {
      eventId: params.id,
      roundId: params.roundId,
      status: round.status,
    })
    return NextResponse.json({ error: 'Round is not active' }, { status: 409 })
  }

  // Authorize. Admins can end anytime. Participants (client auto-end) can only
  // end once the timer has elapsed — prevents a malicious participant from
  // ending a round early for everyone.
  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    const timerExpired = round.ends_at && new Date(round.ends_at) <= new Date()
    if (!timerExpired) {
      breakoutLogServer('round-end', 'forbidden', 'timer not elapsed (non-admin)', {
        eventId: params.id,
        roundId: params.roundId,
        endsAt: round.ends_at,
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const endedAt = new Date()

  // Atomically flip status — guards against concurrent calls.
  const { data: statusFlip } = await admin
    .from('neighbors_rounds')
    .update({ status: 'completed', ended_at: endedAt.toISOString() })
    .eq('id', params.roundId)
    .eq('status', 'active')
    .select('id')

  if (!statusFlip?.length) {
    breakoutLogServer('round-end', 'idempotent', 'concurrent end won race', { eventId: params.id, roundId: params.roundId })
    return NextResponse.json({ ok: true, alreadyEnded: true })
  }

  // Stop egress for every recording attached to this round's breakout rooms.
  const { data: recordings } = await admin
    .from('neighbors_recordings')
    .select('id, egress_id, neighbors_rooms!inner(round_id)')
    .eq('neighbors_rooms.round_id', params.roundId)
    .eq('transcription_status', 'pending')

  if (recordings) {
    for (const recording of recordings) {
      if (recording.egress_id) {
        try {
          await stopRoomRecording(recording.egress_id)
        } catch (err) {
          breakoutLogServerError('round-end', 'egress_stop_failed', err, {
            eventId: params.id,
            roundId: params.roundId,
            egress_id: recording.egress_id,
            recordingId: recording.id,
          })
          console.error(`Failed to stop egress ${recording.egress_id}:`, err)
          await logEvent({
            pipeline: 'livekit.egress.stop',
            entityId: recording.id,
            entityType: 'recording',
            userId: user.id,
            error: err,
            metadata: {
              event_id: params.id,
              round_id: params.roundId,
              egress_id: recording.egress_id,
            },
          })
        }
      }
    }
  }

  // Close breakout memberships and return everyone to the main room.
  const { data: breakoutMembers } = await admin
    .from('neighbors_room_members')
    .select('user_id, neighbors_rooms!inner(round_id)')
    .eq('neighbors_rooms.round_id', params.roundId)
    .is('left_at', null)

  const returningUserIds = [...new Set((breakoutMembers || []).map((m) => m.user_id))]
  breakoutLogServer('round-end', 'returning', 'from breakouts to main', {
    eventId: params.id,
    roundId: params.roundId,
    returnCount: returningUserIds.length,
    userIds: returningUserIds,
  })

  if (returningUserIds.length > 0) {
    await admin
      .from('neighbors_room_members')
      .update({ left_at: endedAt.toISOString() })
      .in('user_id', returningUserIds)
      .is('left_at', null)

    const { data: mainRoom } = await admin
      .from('neighbors_rooms')
      .select('id')
      .eq('event_id', params.id)
      .eq('room_type', 'main')
      .maybeSingle()

    if (mainRoom) {
      await admin.from('neighbors_room_members').upsert(
        returningUserIds.map((uid) => ({
          room_id: mainRoom.id,
          user_id: uid,
          joined_at: endedAt.toISOString(),
          left_at: null,
          role: 'participant',
        })),
        { onConflict: 'room_id,user_id' }
      )
    }
  }

  // Tear down the LiveKit breakout rooms — they won't be reused (each round
  // gets fresh room names) and keeping them open costs nothing but can delay
  // egress cleanup. Idempotent per room.
  const { data: breakoutRooms } = await admin
    .from('neighbors_rooms')
    .select('id, livekit_room_name')
    .eq('round_id', params.roundId)
    .eq('room_type', 'breakout')

  if (breakoutRooms?.length) {
    await Promise.all(
      breakoutRooms.map(async (r) => {
        try {
          await deleteLiveKitRoom(r.livekit_room_name)
        } catch (err) {
          breakoutLogServerError('round-end', 'livekit_delete_failed', err, {
            eventId: params.id,
            roundId: params.roundId,
            roomId: r.id,
            livekitRoomName: r.livekit_room_name,
          })
        }
      })
    )
  }

  breakoutLogServer('round-end', 'complete', 'ok', { eventId: params.id, roundId: params.roundId })
  return NextResponse.json({ ok: true })
}
