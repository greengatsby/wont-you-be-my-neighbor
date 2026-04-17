import { AccessToken } from 'livekit-server-sdk'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { roomName } = await request.json()

  if (!roomName) {
    return NextResponse.json({ error: 'roomName required' }, { status: 400 })
  }

  // Verify the room exists and this user is assigned to it
  const admin = createAdminClient()
  const { data: room } = await admin
    .from('neighbors_breakout_rooms')
    .select('id')
    .eq('livekit_room_name', roomName)
    .maybeSingle()

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  const { data: membership } = await supabase
    .from('neighbors_room_members')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: 'Not assigned to this room' }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('display_name')
    .eq('id', user.id)
    .single()

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

  return NextResponse.json({ token })
}
