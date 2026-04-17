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

  const [{ data: event }, { data: profile }, { count }, { data: membership }] = await Promise.all([
    supabase
      .from('neighbors_events')
      .select('*, neighbors_rounds(*)')
      .eq('id', params.id)
      .single(),
    supabase.from('neighbors_users').select('*').eq('id', user.id).single(),
    supabase
      .from('neighbors_event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', params.id),
    supabase
      .from('neighbors_event_participants')
      .select('user_id')
      .eq('event_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!event) redirect('/')

  return (
    <EventLobby
      event={event}
      rounds={event.neighbors_rounds || []}
      user={profile!}
      participantCount={count || 0}
      isParticipant={!!membership}
    />
  )
}
