import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EventLobby } from '@/components/event-lobby'

export default async function LobbyPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('neighbors_events')
    .select('*, neighbors_rounds(*)')
    .eq('id', params.id)
    .single()

  if (!event) redirect('/')

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Auto-join as participant
  await supabase
    .from('neighbors_event_participants')
    .upsert(
      { event_id: params.id, user_id: user.id },
      { onConflict: 'event_id,user_id' }
    )

  // Get participant count
  const { count } = await supabase
    .from('neighbors_event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', params.id)

  return (
    <EventLobby
      event={event}
      rounds={event.neighbors_rounds || []}
      user={profile!}
      participantCount={count || 0}
    />
  )
}
