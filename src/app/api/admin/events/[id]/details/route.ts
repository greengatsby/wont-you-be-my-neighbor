import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

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

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const admin = createAdminClient()
  const eventId = params.id

  const { data: event, error: eventErr } = await admin
    .from('neighbors_events')
    .select('*, neighbors_rounds(*)')
    .eq('id', eventId)
    .single()
  if (eventErr || !event) {
    return NextResponse.json({ error: eventErr?.message || 'Event not found' }, { status: 404 })
  }

  const { data: rooms } = await admin
    .from('neighbors_rooms')
    .select('id, livekit_room_name, room_type, round_id, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  const roomIds = (rooms || []).map((r) => r.id)

  const { data: recordings } = roomIds.length
    ? await admin
        .from('neighbors_recordings')
        .select('id, room_id, egress_id, storage_url, transcription_status, duration_seconds, created_at')
        .in('room_id', roomIds)
        .order('created_at', { ascending: true })
    : { data: [] as any[] }

  const recordingIds = (recordings || []).map((r) => r.id)

  const { data: transcripts } = recordingIds.length
    ? await admin
        .from('neighbors_transcripts')
        .select('id, recording_id, speaker_user_id, text, start_time, end_time')
        .in('recording_id', recordingIds)
        .order('start_time', { ascending: true })
    : { data: [] as any[] }

  const { data: members } = roomIds.length
    ? await admin
        .from('neighbors_room_members')
        .select('room_id, user_id, role, joined_at, left_at')
        .in('room_id', roomIds)
    : { data: [] as any[] }

  const userIds = new Set<string>()
  ;(members || []).forEach((m) => m.user_id && userIds.add(m.user_id))
  ;(transcripts || []).forEach((t) => t.speaker_user_id && userIds.add(t.speaker_user_id))

  const { data: tags } = await admin
    .from('neighbors_interest_tags')
    .select('id, user_id, tag, confidence, source_event_id')
    .eq('source_event_id', eventId)

  ;(tags || []).forEach((t) => t.user_id && userIds.add(t.user_id))

  const { data: connections } = await admin
    .from('neighbors_connections')
    .select('id, user_a, user_b, shared_tags, similarity_score, event_id, created_at')
    .eq('event_id', eventId)

  ;(connections || []).forEach((c) => {
    if (c.user_a) userIds.add(c.user_a)
    if (c.user_b) userIds.add(c.user_b)
  })

  const userList = [...userIds]
  const { data: users } = userList.length
    ? await admin
        .from('neighbors_users')
        .select('id, display_name')
        .in('id', userList)
    : { data: [] as any[] }

  const userMap: Record<string, { display_name: string | null }> = {}
  ;(users || []).forEach((u) => {
    userMap[u.id] = { display_name: u.display_name }
  })

  return NextResponse.json({
    event,
    rooms: rooms || [],
    recordings: recordings || [],
    transcripts: transcripts || [],
    members: members || [],
    tags: tags || [],
    connections: connections || [],
    users: userMap,
  })
}
