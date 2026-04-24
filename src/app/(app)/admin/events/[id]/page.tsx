import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EventDetailViewer } from '@/components/event-detail-viewer'

export const dynamic = 'force-dynamic'

export default async function AdminEventPage({
  params,
}: {
  params: { id: string }
}) {
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

  return <EventDetailViewer eventId={params.id} />
}
