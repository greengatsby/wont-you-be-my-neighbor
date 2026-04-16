import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

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
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()

  // Get all recordings for this event that are completed (transcribed)
  const { data: recordings } = await admin
    .from('neighbors_recordings')
    .select(`
      *,
      neighbors_breakout_rooms!inner(
        round_id,
        neighbors_rounds!inner(event_id)
      )
    `)
    .eq('neighbors_breakout_rooms.neighbors_rounds.event_id', params.id)
    .eq('transcription_status', 'completed')

  if (!recordings?.length) {
    return NextResponse.json({ error: 'No transcribed recordings found' }, { status: 400 })
  }

  // Get transcripts for each recording
  const recordingIds = recordings.map((r) => r.id)
  const { data: transcripts } = await admin
    .from('neighbors_transcripts')
    .select('*, neighbors_users:speaker_user_id(display_name)')
    .in('recording_id', recordingIds)
    .order('start_time')

  if (!transcripts?.length) {
    return NextResponse.json({ error: 'No transcripts found' }, { status: 400 })
  }

  // Group transcripts by speaker
  const speakerTranscripts = new Map<string, string[]>()
  for (const t of transcripts) {
    if (!t.speaker_user_id) continue
    const existing = speakerTranscripts.get(t.speaker_user_id) || []
    existing.push(t.text)
    speakerTranscripts.set(t.speaker_user_id, existing)
  }

  // Extract interests for each speaker using Claude
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

  // Store interest tags
  for (const { userId, tags } of results) {
    const inserts = tags.map((tag) => ({
      user_id: userId,
      tag: tag.toLowerCase(),
      confidence: 1.0,
      source_event_id: params.id,
    }))

    await admin.from('neighbors_interest_tags').insert(inserts)
  }

  // Generate connections based on shared tags
  const participantIds = [...speakerTranscripts.keys()]
  const connectionsCreated = []

  for (let i = 0; i < participantIds.length; i++) {
    for (let j = i + 1; j < participantIds.length; j++) {
      const userA = participantIds[i] < participantIds[j] ? participantIds[i] : participantIds[j]
      const userB = participantIds[i] < participantIds[j] ? participantIds[j] : participantIds[i]

      const tagsA = results.find((r) => r.userId === participantIds[i])?.tags || []
      const tagsB = results.find((r) => r.userId === participantIds[j])?.tags || []

      const shared = tagsA.filter((t) =>
        tagsB.some((b) => b.toLowerCase() === t.toLowerCase())
      )

      if (shared.length > 0) {
        const similarity = shared.length / Math.max(tagsA.length, tagsB.length)

        await admin.from('neighbors_connections').upsert(
          {
            user_a: userA,
            user_b: userB,
            shared_tags: shared,
            similarity_score: similarity,
            event_id: params.id,
          },
          { onConflict: 'user_a,user_b' }
        )

        connectionsCreated.push({ userA, userB, shared, similarity })
      }
    }
  }

  return NextResponse.json({
    interestsExtracted: results.length,
    connectionsCreated: connectionsCreated.length,
  })
}
