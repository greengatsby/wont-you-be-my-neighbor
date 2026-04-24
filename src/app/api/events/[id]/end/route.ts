import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { deleteLiveKitRoom, stopRoomRecording } from '@/lib/livekit'
import { transcribeEventRecordings, processEventInterests } from '@/lib/event-pipeline'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()

  // Stop all active recordings for this event (main room + any breakouts)
  const { data: recordings } = await admin
    .from('neighbors_recordings')
    .select(`
      id, egress_id,
      neighbors_rooms!inner(event_id)
    `)
    .eq('neighbors_rooms.event_id', params.id)
    .eq('transcription_status', 'pending')

  if (recordings) {
    for (const recording of recordings) {
      if (recording.egress_id) {
        try {
          await stopRoomRecording(recording.egress_id)
        } catch (err) {
          console.error(`Failed to stop egress ${recording.egress_id}:`, err)
        }
      }
    }
  }

  const endedAt = new Date().toISOString()

  // End all active rounds
  await admin
    .from('neighbors_rounds')
    .update({ status: 'completed', ended_at: endedAt })
    .eq('event_id', params.id)
    .eq('status', 'active')

  // Close all open room memberships for this event's rooms.
  const { data: eventRooms } = await admin
    .from('neighbors_rooms')
    .select('id, livekit_room_name, room_type')
    .eq('event_id', params.id)

  if (eventRooms?.length) {
    await admin
      .from('neighbors_room_members')
      .update({ left_at: endedAt })
      .in('room_id', eventRooms.map((r) => r.id))
      .is('left_at', null)

    // Delete every LiveKit room for this event — main, breakouts, adhoc.
    // Idempotent if LiveKit already auto-closed them. Done in parallel.
    await Promise.all(
      eventRooms.map(async (r) => {
        try {
          await deleteLiveKitRoom(r.livekit_room_name)
        } catch (err) {
          console.error(`Failed to delete LiveKit room ${r.livekit_room_name}:`, err)
        }
      })
    )

    // Remove empty breakout / adhoc rows so the next time we look at the
    // event's room list we don't see stale entries. Main room stays so its
    // recordings remain linked for transcription.
    const disposableRoomIds = eventRooms
      .filter((r) => r.room_type !== 'main')
      .map((r) => r.id)
    if (disposableRoomIds.length > 0) {
      // Only delete rooms that have no associated recordings — preserve
      // anything that captured audio so transcription + connection
      // extraction downstream still work.
      const { data: roomsWithRecordings } = await admin
        .from('neighbors_recordings')
        .select('room_id')
        .in('room_id', disposableRoomIds)

      const keepIds = new Set((roomsWithRecordings || []).map((r) => r.room_id))
      const deletableIds = disposableRoomIds.filter((id) => !keepIds.has(id))
      if (deletableIds.length > 0) {
        await admin
          .from('neighbors_rooms')
          .delete()
          .in('id', deletableIds)
      }
    }
  }

  // End event
  await admin
    .from('neighbors_events')
    .update({ status: 'ended', ended_at: endedAt })
    .eq('id', params.id)

  // Run transcription and interest extraction server-side so the admin's browser
  // closing mid-way cannot leave the event half-processed.
  const transcriptionResult = await transcribeEventRecordings(params.id, admin)
  const processingResult = await processEventInterests(params.id, admin)

  return NextResponse.json({
    ok: true,
    transcribed: transcriptionResult.transcribed,
    interestsExtracted: processingResult.interestsExtracted,
    connectionsCreated: processingResult.connectionsCreated,
    transcriptionErrors: transcriptionResult.errors.length > 0
      ? transcriptionResult.errors
      : undefined,
  })
}
