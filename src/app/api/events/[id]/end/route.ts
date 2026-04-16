import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { stopRoomRecording } from '@/lib/livekit'

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

  // Stop all active recordings for this event
  const { data: recordings } = await admin
    .from('neighbors_recordings')
    .select(`
      id, egress_id,
      neighbors_breakout_rooms!inner(
        neighbors_rounds!inner(event_id)
      )
    `)
    .eq('neighbors_breakout_rooms.neighbors_rounds.event_id', params.id)
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

  // End all active rounds
  await admin
    .from('neighbors_rounds')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('event_id', params.id)
    .eq('status', 'active')

  // End event
  await admin
    .from('neighbors_events')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', params.id)

  return NextResponse.json({ ok: true })
}
