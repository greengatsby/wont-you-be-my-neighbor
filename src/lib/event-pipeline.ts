import { SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { transcribeFromUrl } from '@/lib/transcription'

const anthropic = new Anthropic()

// ---------------------------------------------------------------------------
// Transcription
// ---------------------------------------------------------------------------

export interface TranscriptionResult {
  transcribed: number
  total: number
  errors: string[]
}

export async function transcribeEventRecordings(
  eventId: string,
  admin: SupabaseClient
): Promise<TranscriptionResult> {
  // Only transcribe breakout rooms — main/adhoc rooms have too many
  // overlapping speakers for diarization to be useful.
  const { data: recordings } = await admin
    .from('neighbors_recordings')
    .select(`
      id, storage_url, room_id,
      neighbors_rooms!inner(
        id, room_type,
        neighbors_rounds!inner(event_id),
        neighbors_room_members(user_id)
      )
    `)
    .eq('neighbors_rooms.neighbors_rounds.event_id', eventId)
    .eq('neighbors_rooms.room_type', 'breakout')
    .eq('transcription_status', 'pending')

  if (!recordings?.length) {
    return { transcribed: 0, total: 0, errors: [] }
  }

  let transcribedCount = 0
  const errors: string[] = []

  for (const recording of recordings) {
    try {
      await admin
        .from('neighbors_recordings')
        .update({ transcription_status: 'processing' })
        .eq('id', recording.id)

      if (!recording.storage_url) {
        throw new Error('No storage URL for recording')
      }

      const segments = await transcribeFromUrl(recording.storage_url)

      if (!segments.length) {
        throw new Error('No transcript segments returned')
      }

      // Map AssemblyAI speaker letters (A, B, …) to room member IDs by join order.
      // NOTE: this mapping is best-effort — diarization order may not match DB order.
      const roomMembers =
        (recording.neighbors_rooms as any)?.neighbors_room_members || []
      const memberIds = roomMembers.map((m: any) => m.user_id)

      const transcriptInserts = segments.map((seg) => ({
        recording_id: recording.id,
        speaker_user_id: memberIds[seg.speakerIndex] ?? null,
        text: seg.text,
        start_time: seg.startTime,
        end_time: seg.endTime,
      }))

      await admin.from('neighbors_transcripts').insert(transcriptInserts)

      const duration = segments.length > 0
        ? Math.ceil(segments[segments.length - 1].endTime)
        : null

      await admin
        .from('neighbors_recordings')
        .update({ transcription_status: 'completed', duration_seconds: duration })
        .eq('id', recording.id)

      transcribedCount++
    } catch (err: any) {
      console.error(`Failed to transcribe recording ${recording.id}:`, err)
      errors.push(`${recording.id}: ${err.message}`)
      await admin
        .from('neighbors_recordings')
        .update({ transcription_status: 'failed' })
        .eq('id', recording.id)
    }
  }

  return { transcribed: transcribedCount, total: recordings.length, errors }
}

// ---------------------------------------------------------------------------
// Interest extraction + connection generation
// ---------------------------------------------------------------------------

export interface ProcessingResult {
  interestsExtracted: number
  connectionsCreated: number
}

export async function processEventInterests(
  eventId: string,
  admin: SupabaseClient
): Promise<ProcessingResult> {
  const { data: recordings } = await admin
    .from('neighbors_recordings')
    .select(`
      *,
      neighbors_rooms!inner(
        round_id, room_type,
        neighbors_rounds!inner(event_id)
      )
    `)
    .eq('neighbors_rooms.neighbors_rounds.event_id', eventId)
    .eq('neighbors_rooms.room_type', 'breakout')
    .eq('transcription_status', 'completed')

  if (!recordings?.length) {
    return { interestsExtracted: 0, connectionsCreated: 0 }
  }

  const recordingIds = recordings.map((r) => r.id)
  const { data: transcripts } = await admin
    .from('neighbors_transcripts')
    .select('*, neighbors_users:speaker_user_id(display_name)')
    .in('recording_id', recordingIds)
    .order('start_time')

  if (!transcripts?.length) {
    return { interestsExtracted: 0, connectionsCreated: 0 }
  }

  // Group transcript text by speaker
  const speakerTranscripts = new Map<string, string[]>()
  for (const t of transcripts) {
    if (!t.speaker_user_id) continue
    const existing = speakerTranscripts.get(t.speaker_user_id) || []
    existing.push(t.text)
    speakerTranscripts.set(t.speaker_user_id, existing)
  }

  // Extract interest tags per speaker via Claude (sequential — avoids rate limits)
  const results: { userId: string; tags: string[] }[] = []

  for (const [userId, texts] of speakerTranscripts) {
    const combined = texts.join('\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze this person's conversation from a neighborhood meetup event. Extract their interests, hobbies, passions, and topics they care about. Return ONLY a JSON array of short interest tags (1-3 words each). Be specific — "community gardening" not just "gardening". Include at most 10 tags.

Conversation:
${combined}

Return format: ["tag1", "tag2", ...]`,
        },
      ],
    })

    try {
      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        const tags = JSON.parse(match[0]) as string[]
        results.push({ userId, tags })
      }
    } catch {
      console.error(`Failed to parse interests for user ${userId}`)
    }
  }

  // Persist interest tags
  for (const { userId, tags } of results) {
    const inserts = tags.map((tag) => ({
      user_id: userId,
      tag: tag.toLowerCase(),
      confidence: 1.0,
      source_event_id: eventId,
    }))
    await admin.from('neighbors_interest_tags').insert(inserts)
  }

  // Generate connections between all speakers who share tags
  const participantIds = [...speakerTranscripts.keys()]
  let connectionsCreated = 0

  for (let i = 0; i < participantIds.length; i++) {
    for (let j = i + 1; j < participantIds.length; j++) {
      const userA = participantIds[i] < participantIds[j] ? participantIds[i] : participantIds[j]
      const userB = participantIds[i] < participantIds[j] ? participantIds[j] : participantIds[i]

      const tagsA = results.find((r) => r.userId === participantIds[i])?.tags || []
      const tagsB = results.find((r) => r.userId === participantIds[j])?.tags || []
      const shared = tagsA.filter((t) => tagsB.some((b) => b.toLowerCase() === t.toLowerCase()))

      if (shared.length > 0) {
        const similarity = shared.length / Math.max(tagsA.length, tagsB.length)
        await admin.from('neighbors_connections').upsert(
          { user_a: userA, user_b: userB, shared_tags: shared, similarity_score: similarity, event_id: eventId },
          { onConflict: 'user_a,user_b' }
        )
        connectionsCreated++
      }
    }
  }

  return { interestsExtracted: results.length, connectionsCreated }
}
