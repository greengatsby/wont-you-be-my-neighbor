import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { ensureMainRoom } from '@/lib/rooms'

// Create and immediately launch a session (a no-ceremony event with no rounds).
// Admin-only. Host can spin up ad-hoc breakouts via the existing host controls.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin, display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const title: string =
    (typeof body.title === 'string' && body.title.trim()) ||
    `${profile.display_name || 'Neighbor'}'s session`

  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: event, error: insertError } = await admin
    .from('neighbors_events')
    .insert({
      title,
      host_id: user.id,
      status: 'live',
      started_at: now,
    })
    .select('id')
    .single()

  if (insertError || !event) {
    return NextResponse.json({ error: insertError?.message || 'Failed to create session' }, { status: 500 })
  }

  const mainRoomName = await ensureMainRoom(admin, event.id)

  await admin
    .from('neighbors_events')
    .update({ livekit_room_name: mainRoomName })
    .eq('id', event.id)

  return NextResponse.json({ ok: true, eventId: event.id })
}
