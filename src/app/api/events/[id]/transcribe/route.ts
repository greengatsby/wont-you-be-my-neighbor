import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { transcribeFromUrl } from '@/lib/transcription'

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

  // Get all pending recordings for this event
  const { data: recordings } = await admin
    .from('neighbors_recordings')
    .select(`
      id, storage_url, room_id,
      neighbors_breakout_rooms!inner(
        id,
        neighbors_rounds!inner(event_id),
        neighbors_room_members(user_id)
      )
    `)
    .eq('neighbors_breakout_rooms.neighbors_rounds.event_id', params.id)
    .eq('transcription_status', 'pending')

  if (!recordings?.length) {
    return NextResponse.json({ message: 'No pending recordings', transcribed: 0 })
  }

  let transcribedCount = 0
  const errors: string[] = []

  for (const recording of recordings) {
    try {
      // Mark as processing
      await admin
        .from('neighbors_recordings')
        .update({ transcription_status: 'processing' })
        .eq('id', recording.id)

      if (!recording.storage_url) {
        throw new Error('No storage URL for recording')
      }

      // Transcribe via Deepgram using the public R2 URL
      const segments = await transcribeFromUrl(recording.storage_url)

      if (!segments.length) {
        throw new Error('No transcript segments returned')
      }

      // Map speaker indices to actual user IDs
      // In a 1:1 breakout room, speaker 0 and 1 map to the two participants
      const roomMembers = (recording.neighbors_breakout_rooms as any)?.neighbors_room_members || []
      const memberIds = roomMembers.map((m: any) => m.user_id)

      // Insert transcript segments
      const transcriptInserts = segments.map((seg) => ({
        recording_id: recording.id,
        speaker_user_id: memberIds[seg.speakerIndex] || null,
        text: seg.text,
        start_time: seg.startTime,
        end_time: seg.endTime,
      }))

      await admin.from('neighbors_transcripts').insert(transcriptInserts)

      // Calculate duration from last segment
      const duration = segments.length > 0
        ? Math.ceil(segments[segments.length - 1].endTime)
        : null

      // Mark as completed
      await admin
        .from('neighbors_recordings')
        .update({
          transcription_status: 'completed',
          duration_seconds: duration,
        })
        .eq('id', recording.id)

      transcribedCount++
    } catch (err: any) {
      console.error(`Failed to transcribe recording ${recording.id}:`, err)
      errors.push(`${recording.id}: ${err.message}`)

      await admin
        .from('neighbors_recordings')
        .update({ transcription_status: 'failed' })
        .eq('id', recording.id)
    }
  }

  return NextResponse.json({
    transcribed: transcribedCount,
    total: recordings.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
