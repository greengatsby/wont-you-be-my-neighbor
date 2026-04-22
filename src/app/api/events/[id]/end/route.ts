import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { stopRoomRecording } from '@/lib/livekit'
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
    .select('id')
    .eq('event_id', params.id)

  if (eventRooms?.length) {
    await admin
      .from('neighbors_room_members')
      .update({ left_at: endedAt })
      .in('room_id', eventRooms.map((r) => r.id))
      .is('left_at', null)
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
