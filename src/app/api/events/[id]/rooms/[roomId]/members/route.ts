import { NextResponse } from 'next/server'
import { breakoutLogServer } from '@/lib/breakout-debug-log'
import { moveUsersToRoom, requireEventHost } from '@/lib/rooms'

// Move one or more users into this room. Closes their current memberships
// elsewhere in the event. Used for manual host reassignment, host hop-in
// (pass your own user_id), and seeding ad-hoc rooms after creation.
export async function POST(
  request: Request,
  { params }: { params: { id: string; roomId: string } }
) {
  const auth = await requireEventHost(params.id)
  if (auth instanceof Response) return auth
  const { admin } = auth

  const body = await request.json().catch(() => ({}))
  breakoutLogServer('rooms.members', 'start', 'host move', {
    eventId: params.id,
    targetRoomId: params.roomId,
  })
  const userIds: string[] = Array.isArray(body.user_ids) ? body.user_ids : []

  if (userIds.length === 0) {
    breakoutLogServer('rooms.members', 'bad_request', 'empty user_ids', { eventId: params.id })
    return NextResponse.json({ error: 'user_ids required' }, { status: 400 })
  }

  const { data: room } = await admin
    .from('neighbors_rooms')
    .select('id, event_id, room_type')
    .eq('id', params.roomId)
    .single()

  if (!room) {
    breakoutLogServer('rooms.members', 'not_found', 'room', { eventId: params.id, roomId: params.roomId })
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
  if (room.event_id !== params.id) {
    breakoutLogServer('rooms.members', 'bad_request', 'room wrong event', {
      eventId: params.id,
      roomId: params.roomId,
    })
    return NextResponse.json({ error: 'Room does not belong to this event' }, { status: 400 })
  }
  breakoutLogServer('rooms.members', 'move', 'resolving', {
    eventId: params.id,
    targetRoomId: room.id,
    roomType: room.room_type,
    userIds,
  })

  const { data: event } = await admin
    .from('neighbors_events')
    .select('host_id')
    .eq('id', params.id)
    .single()

  const hostId = event?.host_id
  const nonHosts = userIds.filter((id) => id !== hostId)
  const hostInGroup = hostId && userIds.includes(hostId)

  if (nonHosts.length > 0) {
    await moveUsersToRoom(admin, nonHosts, room.id, 'participant')
  }
  if (hostInGroup) {
    await moveUsersToRoom(admin, [hostId!], room.id, 'host')
  }

  breakoutLogServer('rooms.members', 'complete', 'ok', { eventId: params.id, moved: userIds.length })
  return NextResponse.json({ ok: true, moved: userIds.length })
}
