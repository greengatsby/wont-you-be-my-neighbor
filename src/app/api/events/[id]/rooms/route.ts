import { NextResponse } from 'next/server'
import { ensureRoom, startRoomRecording } from '@/lib/livekit'
import { moveUsersToRoom, requireEventHost } from '@/lib/rooms'

// Create an ad-hoc room, independent of any round. Optionally seeds it with
// members (moving them out of whichever room they were in).
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventHost(params.id)
  if (auth instanceof Response) return auth
  const { admin } = auth

  const body = await request.json().catch(() => ({}))
  const topic: string | undefined = body.topic
  const memberIds: string[] = Array.isArray(body.member_ids) ? body.member_ids : []

  const roomName = `adhoc-${params.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  const { data: room, error: insertError } = await admin
    .from('neighbors_rooms')
    .insert({
      event_id: params.id,
      round_id: null,
      room_type: 'adhoc',
      livekit_room_name: roomName,
      topic: topic || null,
    })
    .select('*')
    .single()

  if (insertError || !room) {
    return NextResponse.json({ error: insertError?.message || 'Failed to create room' }, { status: 500 })
  }

  try {
    await ensureRoom(roomName)
    const recording = await startRoomRecording(roomName, room.id)
    await admin.from('neighbors_recordings').insert({
      room_id: room.id,
      egress_id: recording.egressId,
      storage_url: recording.storageUrl,
      transcription_status: 'pending',
    })
  } catch (err) {
    console.error(`Failed to start recording for adhoc room ${room.id}:`, err)
  }

  if (memberIds.length > 0) {
    await moveUsersToRoom(admin, memberIds, room.id, 'participant')
  }

  return NextResponse.json({ ok: true, room })
}
