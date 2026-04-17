import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { transcribeEventRecordings } from '@/lib/event-pipeline'

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
  const result = await transcribeEventRecordings(params.id, admin)

  return NextResponse.json({
    transcribed: result.transcribed,
    total: result.total,
    errors: result.errors.length > 0 ? result.errors : undefined,
  })
}
