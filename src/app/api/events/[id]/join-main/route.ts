import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Called when a user enters the event lobby. Opens (or reopens) their
// membership in the main room so the client can reconcile on realtime
// membership changes and connect to the right LiveKit room.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: event } = await admin
    .from('neighbors_events')
    .select('host_id, status')
    .eq('id', params.id)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const isHost = event.host_id === user.id

  if (!isHost) {
    const { data: rsvp } = await admin
      .from('neighbors_event_participants')
      .select('id')
      .eq('event_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!rsvp) {
      return NextResponse.json({ error: 'Not a participant of this event' }, { status: 403 })
    }
  }

  const { data: mainRoom } = await admin
    .from('neighbors_rooms')
    .select('id, livekit_room_name')
    .eq('event_id', params.id)
    .eq('room_type', 'main')
    .maybeSingle()

  if (!mainRoom) {
    return NextResponse.json({ error: 'Event has not started yet' }, { status: 409 })
  }

  // If the user already has an open membership in a breakout/adhoc room for
  // this event, don't yank them out — they should stay where they are.
  const { data: openMemberships } = await admin
    .from('neighbors_room_members')
    .select('room_id, neighbors_rooms!inner(event_id, room_type)')
    .eq('user_id', user.id)
    .eq('neighbors_rooms.event_id', params.id)
    .is('left_at', null)

  const inNonMain = (openMemberships || []).some(
    (m: any) => m.neighbors_rooms?.room_type !== 'main'
  )

  if (inNonMain) {
    return NextResponse.json({ ok: true, mainRoomName: mainRoom.livekit_room_name, skipped: true })
  }

  await admin.from('neighbors_room_members').upsert(
    {
      room_id: mainRoom.id,
      user_id: user.id,
      joined_at: new Date().toISOString(),
      left_at: null,
      role: isHost ? 'host' : 'participant',
    },
    { onConflict: 'room_id,user_id' }
  )

  return NextResponse.json({ ok: true, mainRoomName: mainRoom.livekit_room_name })
}
