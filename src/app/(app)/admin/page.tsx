import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CalendarDays, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
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

  const [{ count: sessionsCount }, { count: endedCount }, { count: logsCount }, { count: failedCount }] =
    await Promise.all([
      admin.from('neighbors_events').select('*', { count: 'exact', head: true }),
      admin
        .from('neighbors_events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ended'),
      admin.from('neighbors_pipeline_logs').select('*', { count: 'exact', head: true }),
      admin
        .from('neighbors_pipeline_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed'),
    ])

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage sessions and monitor pipeline health.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/sessions" className="block">
          <Card className="h-full hover:border-foreground/30 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Sessions</CardTitle>
                  <CardDescription>
                    Browse events, open transcripts, retry transcription.
                  </CardDescription>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-2xl font-bold">{sessionsCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{endedCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">ended</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/observability" className="block">
          <Card className="h-full hover:border-foreground/30 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Observability</CardTitle>
                  <CardDescription>
                    Pipeline runs, request traces, and errors across the app.
                  </CardDescription>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-2xl font-bold">{logsCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">runs</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${failedCount ? 'text-red-600' : ''}`}>
                    {failedCount ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
