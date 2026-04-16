import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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
