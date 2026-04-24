import { SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { transcribeFromUrl } from '@/lib/transcription'
import { PipelineLogger, logEvent } from '@/lib/pipeline-logger'
import { existsInR2 } from '@/lib/r2'
import { getEgressStatus, EgressStatus } from '@/lib/livekit'

const anthropic = new Anthropic()

// Extract the object key ("neighbors/recordings/...") from a stored storage_url
// so we can poll R2 directly via HeadObject. Returns null for malformed URLs.
function r2KeyFromStorageUrl(url: string | null): string | null {
  if (!url) return null
  const prefix = process.env.R2_PUBLIC_URL
  if (prefix && url.startsWith(prefix)) {
    return url.slice(prefix.length).replace(/^\/+/, '')
  }
  // Fallback: strip scheme+host, keep path.
  try {
    const u = new URL(url)
    return u.pathname.replace(/^\/+/, '')
  } catch {
    return null
  }
}

// LiveKit egress finalizes upload asynchronously after stopEgress returns.
// AssemblyAI downloads the URL from its side, so it will fail if the object
// is not yet in R2. Poll HeadObject before handing the URL off.
async function waitForR2Upload(
  key: string,
  { timeoutMs = 60_000, intervalMs = 1500 }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await existsInR2(key)) return true
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return existsInR2(key)
}

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
  const logger = new PipelineLogger({
    pipeline: 'event.transcribe',
    entityId: eventId,
    entityType: 'event',
  })
  await logger.init()

  try {
    logger.startStep('fetch_recordings')
    // Transcribe every pending recording for this event (main, breakout, adhoc).
    // Diarization quality degrades past ~6 speakers but is still useful.
    const { data: recordings } = await admin
      .from('neighbors_recordings')
      .select(`
        id, storage_url, room_id, egress_id,
        neighbors_rooms!inner(
          id, room_type, event_id,
          neighbors_room_members(user_id)
        )
      `)
      .eq('neighbors_rooms.event_id', eventId)
      .eq('transcription_status', 'pending')
    logger.endStep('fetch_recordings')
    logger.log(`Found ${recordings?.length || 0} pending recordings`)

    if (!recordings?.length) {
      await logger.complete({ output_context: { transcribed: 0, total: 0 } })
      return { transcribed: 0, total: 0, errors: [] }
    }

    let transcribedCount = 0
    const errors: string[] = []

    for (const recording of recordings) {
      const recStep = `transcribe:${recording.id.slice(0, 8)}`
      logger.startStep(recStep)
      try {
        await admin
          .from('neighbors_recordings')
          .update({ transcription_status: 'processing' })
          .eq('id', recording.id)

        if (!recording.storage_url) {
          throw new Error('No storage URL for recording')
        }

        // Check LiveKit egress state before waiting on R2 — if the egress was
        // aborted or failed, the object will never appear and we should
        // fast-fail instead of sitting on HeadObject for 60s.
        if (recording.egress_id) {
          const eg = await getEgressStatus(recording.egress_id)
          if (eg) {
            const terminalNoOutput =
              eg.status === EgressStatus.EGRESS_ABORTED ||
              eg.status === EgressStatus.EGRESS_FAILED ||
              eg.status === EgressStatus.EGRESS_LIMIT_REACHED
            if (terminalNoOutput) {
              throw new Error(
                `LiveKit egress ended with no usable output (${EgressStatus[eg.status]}${eg.error ? `: ${eg.error}` : ''}). No audio was captured — likely the room emptied before anyone spoke.`
              )
            }
          }
        }

        const key = r2KeyFromStorageUrl(recording.storage_url)
        if (key) {
          const ready = await waitForR2Upload(key)
          if (!ready) {
            throw new Error(
              `R2 object never finalized within timeout: ${key}. LiveKit egress may still be uploading or never wrote a file.`
            )
          }
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

        logger.log(`Transcribed ${recording.id}: ${segments.length} segments`)
        transcribedCount++
      } catch (err: any) {
        console.error(`Failed to transcribe recording ${recording.id}:`, err)
        errors.push(`${recording.id}: ${err.message}`)
        logger.log(`FAILED ${recording.id}: ${err.message}`)
        await admin
          .from('neighbors_recordings')
          .update({ transcription_status: 'failed' })
          .eq('id', recording.id)
        // Also emit a dedicated one-shot log row so failures are easy to query.
        await logEvent({
          pipeline: 'event.transcribe.recording',
          entityId: recording.id,
          entityType: 'recording',
          error: err,
          metadata: { event_id: eventId },
        })
      }
      logger.endStep(recStep)
    }

    await logger.complete({
      output_context: {
        transcribed: transcribedCount,
        total: recordings.length,
        error_count: errors.length,
        errors,
      },
    })
    return { transcribed: transcribedCount, total: recordings.length, errors }
  } catch (err) {
    await logger.fail(err)
    throw err
  }
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
  const logger = new PipelineLogger({
    pipeline: 'event.process_interests',
    entityId: eventId,
    entityType: 'event',
  })
  await logger.init()

  try {
    logger.startStep('fetch_transcripts')
    const { data: recordings } = await admin
      .from('neighbors_recordings')
      .select(`
        *,
        neighbors_rooms!inner(
          round_id, room_type, event_id
        )
      `)
      .eq('neighbors_rooms.event_id', eventId)
      .eq('transcription_status', 'completed')

    if (!recordings?.length) {
      logger.endStep('fetch_transcripts')
      await logger.complete({ output_context: { reason: 'no_completed_recordings' } })
      return { interestsExtracted: 0, connectionsCreated: 0 }
    }

    const recordingIds = recordings.map((r) => r.id)
    const { data: transcripts } = await admin
      .from('neighbors_transcripts')
      .select('*, neighbors_users:speaker_user_id(display_name)')
      .in('recording_id', recordingIds)
      .order('start_time')
    logger.endStep('fetch_transcripts')

    if (!transcripts?.length) {
      await logger.complete({ output_context: { reason: 'no_transcripts' } })
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
    logger.log(`Grouped into ${speakerTranscripts.size} speakers`)

    // Extract interest tags per speaker via Claude (sequential — avoids rate limits)
    logger.startStep('extract_interests')
    const results: { userId: string; tags: string[] }[] = []

    for (const [userId, texts] of speakerTranscripts) {
      const combined = texts.join('\n')

      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
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

        const text = response.content[0].type === 'text' ? response.content[0].text : ''
        const match = text.match(/\[[\s\S]*\]/)
        if (match) {
          const tags = JSON.parse(match[0]) as string[]
          results.push({ userId, tags })
          logger.log(`Extracted ${tags.length} tags for ${userId.slice(0, 8)}`)
        } else {
          logger.log(`No JSON array in Claude response for ${userId.slice(0, 8)}`)
        }
      } catch (err: any) {
        console.error(`Failed to extract interests for user ${userId}:`, err)
        logger.log(`FAILED extract for ${userId.slice(0, 8)}: ${err.message}`)
        await logEvent({
          pipeline: 'event.process_interests.extract',
          entityId: userId,
          entityType: 'user',
          error: err,
          metadata: { event_id: eventId },
        })
      }
    }
    logger.endStep('extract_interests')

    // Persist interest tags
    logger.startStep('persist_tags')
    for (const { userId, tags } of results) {
      const inserts = tags.map((tag) => ({
        user_id: userId,
        tag: tag.toLowerCase(),
        confidence: 1.0,
        source_event_id: eventId,
      }))
      await admin.from('neighbors_interest_tags').insert(inserts)
    }
    logger.endStep('persist_tags')

    // Generate connections between all speakers who share tags
    logger.startStep('generate_connections')
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
    logger.endStep('generate_connections')

    await logger.complete({
      output_context: {
        interestsExtracted: results.length,
        connectionsCreated,
        speakers: speakerTranscripts.size,
      },
    })
    return { interestsExtracted: results.length, connectionsCreated }
  } catch (err) {
    await logger.fail(err)
    throw err
  }
}
