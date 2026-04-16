import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin-dashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  const { data: events } = await supabase
    .from('neighbors_events')
    .select('*, neighbors_rounds(*)')
    .order('created_at', { ascending: false })

  return <AdminDashboard events={events || []} />
}
