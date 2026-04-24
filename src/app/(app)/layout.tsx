import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AppNav } from '@/components/app-nav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Preserve the destination through any bounce to /login, so share links
  // like /events/<id>/lobby survive the consent/name gates.
  const pathname = (await headers()).get('x-pathname') || ''
  const loginUrl = pathname && pathname !== '/'
    ? `/login?redirectTo=${encodeURIComponent(pathname)}`
    : '/login'

  if (!user) redirect(loginUrl)

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user has consented
  if (!profile?.consent_recording || !profile?.consent_ai_processing) {
    redirect(loginUrl)
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
