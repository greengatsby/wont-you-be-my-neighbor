import { AccessToken } from 'livekit-server-sdk'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'
import { breakoutLogServer } from '@/lib/breakout-debug-log'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    breakoutLogServer('livekit.token', 'unauthorized', 'no session', {})
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { roomName, mode } = await request.json().catch(() => ({}))
  const tokenMode = mode === 'monitor' ? 'monitor' : 'participant'
  breakoutLogServer('livekit.token', 'request', 'incoming', {
    userId: user.id,
    roomName,
    mode: tokenMode,
  })

  if (!roomName) {
    breakoutLogServer('livekit.token', 'bad_request', 'missing roomName', { userId: user.id })
    return NextResponse.json({ error: 'roomName required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: room } = await admin
    .from('neighbors_rooms')
    .select('id, event_id, room_type, neighbors_events!inner(host_id)')
    .eq('livekit_room_name', roomName)
    .maybeSingle()

  if (!room) {
    breakoutLogServer('livekit.token', 'not_found', 'no neighbors_rooms row', { userId: user.id, roomName })
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  const hostId = (room.neighbors_events as any)?.host_id
  const isEventHost = hostId === user.id

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('display_name, is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = !!profile?.is_admin

  // Monitor mode: subscribe-only, invisible-to-participants token for hosts
  // observing a breakout from the outside.
  if (mode === 'monitor') {
    if (!isEventHost && !isAdmin) {
      breakoutLogServer('livekit.token', 'forbidden', 'monitor needs host or admin', {
        userId: user.id,
        roomName,
        roomId: room.id,
        roomType: room.room_type,
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (room.room_type !== 'breakout') {
      breakoutLogServer('livekit.token', 'bad_request', 'monitor only for breakout', {
        userId: user.id,
        roomName,
        roomType: room.room_type,
      })
      return NextResponse.json({ error: 'Monitor mode is breakout-only' }, { status: 400 })
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: `${user.id}-obs-${room.id}`,
        name: `${profile?.display_name || 'Host'} (observing)`,
        ttl: '2h',
      }
    )

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: false,
      canPublishData: false,
      canSubscribe: true,
      hidden: true,
    })

    const jwt = await at.toJwt()
    breakoutLogServer('livekit.token', 'issued', 'monitor jwt', {
      userId: user.id,
      roomName,
      roomId: room.id,
      eventId: room.event_id,
    })
    return NextResponse.json({ token: jwt })
  }

  // Participant mode (default)
  if (!isEventHost && !isAdmin) {
    const { data: membership } = await supabase
      .from('neighbors_room_members')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .is('left_at', null)
      .maybeSingle()

    if (!membership) {
      breakoutLogServer('livekit.token', 'forbidden', 'not assigned (participant)', {
        userId: user.id,
        roomName,
        roomId: room.id,
        roomType: room.room_type,
        eventId: room.event_id,
      })
      return NextResponse.json({ error: 'Not assigned to this room' }, { status: 403 })
    }
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: user.id,
      name: profile?.display_name || 'Neighbor',
      ttl: '2h',
    }
  )

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  })

  const token = await at.toJwt()
  breakoutLogServer('livekit.token', 'issued', 'participant jwt', {
    userId: user.id,
    roomName,
    roomId: room.id,
    roomType: room.room_type,
    eventId: room.event_id,
  })
  return NextResponse.json({ token })
}
