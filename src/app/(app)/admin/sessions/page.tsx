import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { AdminSessions, type SessionRow } from '@/components/admin-sessions'

export const dynamic = 'force-dynamic'

export default async function AdminSessionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) redirect('/')

  const admin = createAdminClient()

  const { data: events } = await admin
    .from('neighbors_events')
    .select('id, title, status, scheduled_at, ended_at, created_at, neighbors_rounds(id)')
    .order('created_at', { ascending: false })

  const eventIds = (events || []).map((e) => e.id)

  const { data: recordings } = eventIds.length
    ? await admin
        .from('neighbors_recordings')
        .select('id, transcription_status, neighbors_rooms!inner(event_id)')
        .in('neighbors_rooms.event_id', eventIds)
    : { data: [] as any[] }

  const statsByEvent: Record<
    string,
    { total: number; completed: number; failed: number; pending: number; processing: number }
  > = {}
  for (const r of recordings || []) {
    const eventId = (r as any).neighbors_rooms?.event_id as string | undefined
    if (!eventId) continue
    if (!statsByEvent[eventId]) {
      statsByEvent[eventId] = { total: 0, completed: 0, failed: 0, pending: 0, processing: 0 }
    }
    const s = statsByEvent[eventId]
    s.total++
    const status = r.transcription_status as keyof typeof s
    if (status in s) (s[status] as number)++
  }

  const { data: tagCounts } = eventIds.length
    ? await admin
        .from('neighbors_interest_tags')
        .select('source_event_id')
        .in('source_event_id', eventIds)
    : { data: [] as any[] }

  const tagsByEvent: Record<string, number> = {}
  for (const t of tagCounts || []) {
    if (!t.source_event_id) continue
    tagsByEvent[t.source_event_id] = (tagsByEvent[t.source_event_id] || 0) + 1
  }

  const rows: SessionRow[] = (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    status: e.status,
    scheduled_at: e.scheduled_at,
    ended_at: e.ended_at,
    created_at: e.created_at,
    rounds_count: e.neighbors_rounds?.length || 0,
    recordings: statsByEvent[e.id] || {
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      processing: 0,
    },
    tags_count: tagsByEvent[e.id] || 0,
  }))

  return <AdminSessions rows={rows} />
}
