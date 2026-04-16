import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/app-nav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user has consented
  if (!profile?.consent_recording || !profile?.consent_ai_processing) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav user={profile} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
