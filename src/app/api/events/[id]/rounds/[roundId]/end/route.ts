import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { stopRoomRecording } from '@/lib/livekit'

export async function POST(
  request: Request,
  { params }: { params: { id: string; roundId: string } }
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

  // Verify round belongs to this event and is currently active
  const { data: round } = await admin
    .from('neighbors_rounds')
    .select('id, status')
    .eq('id', params.roundId)
    .eq('event_id', params.id)
    .single()

  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  if (round.status !== 'active') {
    return NextResponse.json({ error: 'Round is not active' }, { status: 409 })
  }

  // Stop egress for all recordings in this round
  const { data: recordings } = await admin
    .from('neighbors_recordings')
    .select('id, egress_id, neighbors_breakout_rooms!inner(round_id)')
    .eq('neighbors_breakout_rooms.round_id', params.roundId)
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

  // Mark round as completed
  await admin
    .from('neighbors_rounds')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', params.roundId)
    .eq('status', 'active')

  return NextResponse.json({ ok: true })
}
