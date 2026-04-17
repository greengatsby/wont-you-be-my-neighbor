import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'

function formatEventTime(scheduledAt: string | null) {
  if (!scheduledAt) return 'Date TBD'
  const d = new Date(scheduledAt)
  const time = format(d, 'h:mm a')
  if (isToday(d)) return `Today at ${time}`
  if (isTomorrow(d)) return `Tomorrow at ${time}`
  return format(d, 'EEE, MMM d · h:mm a')
}

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: events }, { data: profile }] = await Promise.all([
    supabase
      .from('neighbors_events')
      .select('*, neighbors_users!neighbors_events_host_id_fkey(display_name), neighbors_rounds(id), neighbors_event_participants(user_id)')
      .in('status', ['scheduled', 'live'])
      .order('scheduled_at', { ascending: true }),
    user
      ? supabase.from('neighbors_users').select('is_admin').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const isAdmin = !!profile?.is_admin

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
          <p className="text-muted-foreground">
            Drop into a live mixer and meet the people around you.
          </p>
        </div>
        {isAdmin && (
          <Button asChild variant="outline">
            <Link href="/admin">Manage events</Link>
          </Button>
        )}
      </div>

      {!events?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No upcoming events yet</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? 'Head to the admin page to schedule the first one.'
                  : 'Check back soon — a host will schedule one shortly.'}
              </p>
            </div>
            {isAdmin && (
              <Button asChild size="sm">
                <Link href="/admin">Create an event</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const roundCount = (event as any).neighbors_rounds?.length ?? 0
            const participantCount = (event as any).neighbors_event_participants?.length ?? 0
            const hostName = (event as any).neighbors_users?.display_name || 'a neighbor'
            const live = event.status === 'live'
            return (
              <Card key={event.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                    <Badge variant={live ? 'destructive' : 'secondary'} className="shrink-0">
                      {live ? 'Live now' : 'Upcoming'}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatEventTime(event.scheduled_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {participantCount} {participantCount === 1 ? 'person' : 'people'}
                    </span>
                    <span>·</span>
                    <span>{roundCount} {roundCount === 1 ? 'round' : 'rounds'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hosted by {hostName}
                  </p>
                  <Button asChild className="mt-auto w-full">
                    <Link href={`/events/${event.id}/lobby`}>
                      {live ? 'Join now' : 'View details'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
