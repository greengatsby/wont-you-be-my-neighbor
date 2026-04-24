import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { breakoutLogServer, breakoutLogServerError } from '@/lib/breakout-debug-log'
import { startRoomRecording } from '@/lib/livekit'
import { logEvent } from '@/lib/pipeline-logger'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    breakoutLogServer('dispatch', 'unauthorized', 'POST rejected', { eventId: params.id })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('neighbors_users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) {
    breakoutLogServer('dispatch', 'forbidden', 'not admin', { eventId: params.id, userId: user.id })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { roundId } = await request.json()
  const admin = createAdminClient()
  breakoutLogServer('dispatch', 'start', 'admin dispatch round', {
    eventId: params.id,
    roundId,
    userId: user.id,
  })

  // Get round info — also verify it belongs to this event and is still pending
  const { data: round } = await admin
    .from('neighbors_rounds')
    .select('*')
    .eq('id', roundId)
    .eq('event_id', params.id)
    .single()

  if (!round) {
    breakoutLogServer('dispatch', 'round_not_found', 'bad roundId', { eventId: params.id, roundId })
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }
  if (round.status !== 'pending') {
    breakoutLogServer('dispatch', 'round_not_pending', 'cannot dispatch', {
      eventId: params.id,
      roundId,
      status: round.status,
    })
    return NextResponse.json({ error: 'Round already started' }, { status: 409 })
  }

  // Prevent two active rounds at once
  const { data: alreadyActive } = await admin
    .from('neighbors_rounds')
    .select('id')
    .eq('event_id', params.id)
    .eq('status', 'active')
    .maybeSingle()

  if (alreadyActive) {
    breakoutLogServer('dispatch', 'blocked', 'another round active', {
      eventId: params.id,
      activeRoundId: alreadyActive.id,
    })
    return NextResponse.json({ error: 'Another round is already active — end it first' }, { status: 409 })
  }

  // Get event participants
  const { data: participants } = await admin
    .from('neighbors_event_participants')
    .select('user_id')
    .eq('event_id', params.id)

  if (!participants?.length) {
    breakoutLogServer('dispatch', 'no_participants', 'empty event', { eventId: params.id, roundId })
    return NextResponse.json({ error: 'No participants' }, { status: 400 })
  }

  const userIds = participants.map((p) => p.user_id)

  let rooms: { userIds: string[]; topic?: string }[] = []

  if (round.round_type === 'random') {
    rooms = createRandomPairs(userIds)
  } else if (round.round_type === 'matched') {
    rooms = await createMatchedPairs(admin, userIds)
  } else if (round.round_type === 'topic') {
    rooms = await createTopicRooms(admin, userIds, round.topic)
  }

  breakoutLogServer('dispatch', 'assignments', 'computed groups', {
    eventId: params.id,
    roundId,
    roundType: round.round_type,
    participantCount: userIds.length,
    groupCount: rooms.length,
    groups: rooms.map((r) => ({ n: r.userIds.length, topic: r.topic ?? null })),
  })

  const startedAt = new Date()
  const endsAt = new Date(startedAt.getTime() + round.duration_seconds * 1000)

  // Atomically mark round as active — the .eq('status', 'pending') acts as a guard
  // against a concurrent dispatch that passed the checks above.
  const { error: activateError } = await admin
    .from('neighbors_rounds')
    .update({
      status: 'active',
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq('id', roundId)
    .eq('status', 'pending')

  if (activateError) {
    breakoutLogServer('dispatch', 'activate_failed', 'concurrent dispatch?', {
      eventId: params.id,
      roundId,
      dbError: activateError.message,
    })
    return NextResponse.json({ error: 'Failed to activate round — may have been dispatched already' }, { status: 409 })
  }
  breakoutLogServer('dispatch', 'round_activated', 'ok', {
    eventId: params.id,
    roundId,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
  })

  // Close whatever rooms users are currently in (main, ad-hoc, or a prior
  // breakout) so client reconciliation treats the new breakout membership
  // as the sole active one.
  const allAssignedUsers = rooms.flatMap((r) => r.userIds)
  if (allAssignedUsers.length > 0) {
    await admin
      .from('neighbors_room_members')
      .update({ left_at: startedAt.toISOString() })
      .in('user_id', allAssignedUsers)
      .is('left_at', null)
    breakoutLogServer('dispatch', 'cleared_old_memberships', 'assigned users', {
      eventId: params.id,
      roundId,
      userCount: allAssignedUsers.length,
    })
  }

  const createdRooms = []
  for (const room of rooms) {
    const roomName = `breakout-${roundId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    const { data: breakoutRoom } = await admin
      .from('neighbors_rooms')
      .insert({
        event_id: params.id,
        round_id: roundId,
        room_type: 'breakout',
        livekit_room_name: roomName,
        topic: room.topic || round.topic || null,
      })
      .select()
      .single()

    if (breakoutRoom) {
      breakoutLogServer('dispatch', 'breakout_row', 'room + members', {
        eventId: params.id,
        roundId,
        roomId: breakoutRoom.id,
        livekitRoomName: roomName,
        memberCount: room.userIds.length,
        memberUserIds: room.userIds,
      })
      // Upsert so a user who was previously in this exact room (e.g. after a
      // manual reassignment) gets their existing row reopened rather than
      // violating the (room_id, user_id) uniqueness constraint.
      await admin.from('neighbors_room_members').upsert(
        room.userIds.map((uid) => ({
          room_id: breakoutRoom.id,
          user_id: uid,
          joined_at: startedAt.toISOString(),
          left_at: null,
          role: 'participant',
        })),
        { onConflict: 'room_id,user_id' }
      )

      try {
        const recording = await startRoomRecording(roomName, breakoutRoom.id)
        await admin.from('neighbors_recordings').insert({
          room_id: breakoutRoom.id,
          egress_id: recording.egressId,
          storage_url: recording.storageUrl,
          transcription_status: 'pending',
        })
        await logEvent({
          pipeline: 'livekit.egress.start',
          entityId: breakoutRoom.id,
          entityType: 'room',
          userId: user.id,
          metadata: {
            event_id: params.id,
            round_id: roundId,
            egress_id: recording.egressId,
            room_name: roomName,
          },
        })
      } catch (err) {
        breakoutLogServerError('dispatch', 'egress_start_failed', err, {
          eventId: params.id,
          roomId: breakoutRoom.id,
          livekitRoomName: roomName,
        })
        console.error(`Failed to start recording for room ${breakoutRoom.id}:`, err)
        await logEvent({
          pipeline: 'livekit.egress.start',
          entityId: breakoutRoom.id,
          entityType: 'room',
          userId: user.id,
          error: err,
          metadata: { event_id: params.id, round_id: roundId, room_name: roomName },
        })
      }

      createdRooms.push({
        ...breakoutRoom,
        members: room.userIds,
      })
    }
  }

  breakoutLogServer('dispatch', 'complete', 'response', {
    eventId: params.id,
    roundId,
    createdCount: createdRooms.length,
    roomIds: createdRooms.map((r: { id: string }) => r.id),
  })
  return NextResponse.json({ rooms: createdRooms })
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function createRandomPairs(userIds: string[]) {
  const shuffled = fisherYatesShuffle(userIds)
  const pairs: { userIds: string[] }[] = []

  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      pairs.push({ userIds: [shuffled[i], shuffled[i + 1]] })
    } else {
      // Odd person out — add to last room
      if (pairs.length > 0) {
        pairs[pairs.length - 1].userIds.push(shuffled[i])
      } else {
        pairs.push({ userIds: [shuffled[i]] })
      }
    }
  }

  return pairs
}

async function createMatchedPairs(admin: any, userIds: string[]) {
  // Get interest embeddings for matching
  const { data: users } = await admin
    .from('neighbors_users')
    .select('id, interest_embedding')
    .in('id', userIds)

  // If no embeddings yet, fall back to random
  const withEmbeddings = users?.filter((u: any) => u.interest_embedding) || []
  if (withEmbeddings.length < 2) {
    return createRandomPairs(userIds)
  }

  // Simple greedy matching by cosine similarity
  const matched = new Set<string>()
  const pairs: { userIds: string[] }[] = []

  // For users without embeddings, pair randomly
  const noEmbedding = userIds.filter(
    (id) => !withEmbeddings.find((u: any) => u.id === id)
  )

  // For users with embeddings, use pgvector similarity
  // For now, use a simpler approach: pair sequentially from the embedding list
  // In production, you'd do proper cosine similarity matching
  for (let i = 0; i < withEmbeddings.length; i += 2) {
    if (i + 1 < withEmbeddings.length) {
      pairs.push({
        userIds: [withEmbeddings[i].id, withEmbeddings[i + 1].id],
      })
      matched.add(withEmbeddings[i].id)
      matched.add(withEmbeddings[i + 1].id)
    }
  }

  // Combine leftover embedded users with non-embedded users
  const remaining = [
    ...withEmbeddings.filter((u: any) => !matched.has(u.id)).map((u: any) => u.id),
    ...noEmbedding,
  ]

  pairs.push(...createRandomPairs(remaining))

  return pairs
}

async function createTopicRooms(admin: any, userIds: string[], topic?: string | null) {
  if (!topic) {
    // No specific topic — group by most common interest tags
    const { data: tags } = await admin
      .from('neighbors_interest_tags')
      .select('user_id, tag')
      .in('user_id', userIds)

    if (!tags?.length) return createRandomPairs(userIds)

    // Group users by their top tag
    const tagGroups = new Map<string, string[]>()
    for (const t of tags) {
      const group = tagGroups.get(t.tag) || []
      group.push(t.user_id)
      tagGroups.set(t.tag, group)
    }

    const rooms: { userIds: string[]; topic: string }[] = []
    const assigned = new Set<string>()

    // Create rooms for tags with 2+ members
    for (const [tag, members] of tagGroups) {
      const unassigned = members.filter((id) => !assigned.has(id))
      if (unassigned.length >= 2) {
        rooms.push({ userIds: unassigned, topic: tag })
        unassigned.forEach((id) => assigned.add(id))
      }
    }

    // Remaining unassigned users go into a general room
    const remaining = userIds.filter((id) => !assigned.has(id))
    if (remaining.length > 0) {
      rooms.push({ userIds: remaining, topic: 'General' })
    }

    return rooms
  }

  // Specific topic — everyone in one room
  return [{ userIds, topic }]
}
