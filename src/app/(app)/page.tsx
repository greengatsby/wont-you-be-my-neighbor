import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('neighbors_events')
    .select('*, neighbors_users!neighbors_events_host_id_fkey(display_name)')
    .in('status', ['scheduled', 'live'])
    .order('scheduled_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upcoming Events</h1>
        <p className="text-muted-foreground">
          Join an event to meet your neighbors
        </p>
      </div>

      {!events?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No upcoming events. Check back soon!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge variant={event.status === 'live' ? 'destructive' : 'secondary'}>
                    {event.status === 'live' ? 'Live Now' : 'Upcoming'}
                  </Badge>
                </div>
                <CardDescription>
                  {event.scheduled_at
                    ? format(new Date(event.scheduled_at), 'MMM d, yyyy h:mm a')
                    : 'TBD'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Hosted by {(event.neighbors_users as any)?.display_name || 'Unknown'}
                </p>
                <Link href={`/events/${event.id}/lobby`}>
                  <Button className="w-full">
                    {event.status === 'live' ? 'Join Now' : 'View Details'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
