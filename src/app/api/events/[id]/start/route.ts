import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { ensureMainRoom } from '@/lib/rooms'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const mainRoomName = await ensureMainRoom(admin, params.id)

  const { error: eventError } = await admin
    .from('neighbors_events')
    .update({
      status: 'live',
      started_at: new Date().toISOString(),
      livekit_room_name: mainRoomName,
    })
    .eq('id', params.id)

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })

  return NextResponse.json({ ok: true, mainRoomName })
}
