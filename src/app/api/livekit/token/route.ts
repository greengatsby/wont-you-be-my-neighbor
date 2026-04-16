import { AccessToken } from 'livekit-server-sdk'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const { roomName } = await request.json()

  if (!roomName) {
    return NextResponse.json({ error: 'roomName required' }, { status: 400 })
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

  return NextResponse.json({ token })
}
