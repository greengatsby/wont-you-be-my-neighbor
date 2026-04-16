import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConnectionCard } from '@/components/connection-card'

export default async function ConnectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get connections where this user is either user_a or user_b
  const { data: connections } = await supabase
    .from('neighbors_connections')
    .select(`
      *,
      user_a_profile:neighbors_users!neighbors_connections_user_a_fkey(id, display_name, phone),
      user_b_profile:neighbors_users!neighbors_connections_user_b_fkey(id, display_name, phone)
    `)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('similarity_score', { ascending: false })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Your Connections</h1>
        <p className="text-muted-foreground">
          Neighbors matched based on your shared interests
        </p>
      </div>

      {!connections?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No connections yet. Join an event to start meeting neighbors!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => {
            const isUserA = connection.user_a === user.id
            const neighbor = isUserA ? connection.user_b_profile : connection.user_a_profile
            const hasSharedContact = isUserA ? connection.contact_shared_a : connection.contact_shared_b
            const neighborSharedContact = isUserA ? connection.contact_shared_b : connection.contact_shared_a

            return (
              <ConnectionCard
                key={connection.id}
                connectionId={connection.id}
                neighbor={neighbor as any}
                sharedTags={connection.shared_tags || []}
                similarityScore={connection.similarity_score}
                hasSharedContact={hasSharedContact}
                neighborSharedContact={neighborSharedContact}
                isUserA={isUserA}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
