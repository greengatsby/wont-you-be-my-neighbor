import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; res: NextResponse }> {
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

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const admin = createAdminClient()
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500)
  const pipeline = url.searchParams.get('pipeline')
  const status = url.searchParams.get('status')
  const level = url.searchParams.get('level')
  const entityId = url.searchParams.get('entity_id')
  const runId = url.searchParams.get('run_id')
  const userId = url.searchParams.get('user_id')
  const search = url.searchParams.get('search')

  let query = admin
    .from('neighbors_pipeline_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (pipeline) query = query.eq('pipeline', pipeline)
  if (status) query = query.eq('status', status)
  if (level) query = query.eq('level', level)
  if (entityId) query = query.eq('entity_id', entityId)
  if (runId) query = query.eq('run_id', runId)
  if (userId) query = query.eq('user_id', userId)
  if (search) query = query.or(`error_message.ilike.%${search}%,pipeline.ilike.%${search}%`)

  const { data: logs, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const rows = logs || []

  const userIds = [...new Set(rows.map((l) => l.user_id).filter(Boolean))]
  const userMap: Record<string, { display_name: string | null }> = {}
  if (userIds.length) {
    const { data: users } = await admin
      .from('neighbors_users')
      .select('id, display_name')
      .in('id', userIds)
    ;(users || []).forEach((u) => {
      userMap[u.id] = { display_name: u.display_name }
    })
  }

  const durations = rows.filter((l) => typeof l.duration_ms === 'number').map((l) => l.duration_ms as number)
  const avgDurationMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0

  const byPipeline: Record<string, { total: number; failed: number }> = {}
  for (const l of rows) {
    if (!byPipeline[l.pipeline]) byPipeline[l.pipeline] = { total: 0, failed: 0 }
    byPipeline[l.pipeline].total++
    if (l.status === 'failed') byPipeline[l.pipeline].failed++
  }

  const summary = {
    total: rows.length,
    completed: rows.filter((l) => l.status === 'completed').length,
    failed: rows.filter((l) => l.status === 'failed').length,
    running: rows.filter((l) => l.status === 'started' || l.status === 'running').length,
    avgDurationMs,
    byPipeline,
  }

  const { data: pipelines } = await admin
    .from('neighbors_pipeline_logs')
    .select('pipeline')
    .order('pipeline')
  const pipelineList = [...new Set((pipelines || []).map((p) => p.pipeline))]

  return NextResponse.json({
    logs: rows.map((l) => ({
      ...l,
      user_display_name: l.user_id ? userMap[l.user_id]?.display_name ?? null : null,
    })),
    summary,
    pipelines: pipelineList,
  })
}
