import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import {
  transcribeEventRecordings,
  processEventInterests,
} from '@/lib/event-pipeline'

async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; res: NextResponse }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) {
    return { ok: false, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, userId: user.id }
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const admin = createAdminClient()
  const eventId = params.id

  // Reset failed recordings on this event's breakout rooms back to pending so
  // transcribeEventRecordings picks them up again. Include stale 'processing'
  // rows — those are leftovers from a handler that crashed mid-flight.
  const { data: targetRecordings } = await admin
    .from('neighbors_recordings')
    .select(`
      id, transcription_status,
      neighbors_rooms!inner(
        id, room_type,
        neighbors_rounds!inner(event_id)
      )
    `)
    .eq('neighbors_rooms.neighbors_rounds.event_id', eventId)
    .eq('neighbors_rooms.room_type', 'breakout')
    .in('transcription_status', ['failed', 'processing'])

  const idsToReset = (targetRecordings || []).map((r: any) => r.id)
  if (idsToReset.length > 0) {
    await admin
      .from('neighbors_recordings')
      .update({ transcription_status: 'pending' })
      .in('id', idsToReset)
  }

  const transcription = await transcribeEventRecordings(eventId, admin)
  const processing = await processEventInterests(eventId, admin)

  return NextResponse.json({
    ok: true,
    reset: idsToReset.length,
    transcribed: transcription.transcribed,
    total: transcription.total,
    transcriptionErrors: transcription.errors,
    interestsExtracted: processing.interestsExtracted,
    connectionsCreated: processing.connectionsCreated,
  })
}
