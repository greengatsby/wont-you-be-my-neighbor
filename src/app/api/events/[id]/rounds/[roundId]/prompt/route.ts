import { NextResponse } from 'next/server'
import { breakoutLogServer } from '@/lib/breakout-debug-log'
import { requireEventHost } from '@/lib/rooms'

const MAX_PROMPT_LENGTH = 2000

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; roundId: string } }
) {
  const auth = await requireEventHost(params.id)
  if (auth instanceof Response) return auth
  const { admin, userId } = auth

  const body = await request.json().catch(() => ({}))
  const raw = typeof body?.prompt === 'string' ? body.prompt : ''
  const trimmed = raw.trim()
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} chars)` },
      { status: 400 }
    )
  }
  const prompt: string | null = trimmed.length > 0 ? trimmed : null

  const { data: round } = await admin
    .from('neighbors_rounds')
    .select('id, status')
    .eq('id', params.roundId)
    .eq('event_id', params.id)
    .maybeSingle()

  if (!round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }
  if (round.status !== 'active') {
    return NextResponse.json({ error: 'Round is not active' }, { status: 409 })
  }

  const { data: updated, error } = await admin
    .from('neighbors_rounds')
    .update({ prompt })
    .eq('id', params.roundId)
    .eq('status', 'active')
    .select('id, prompt')
    .maybeSingle()

  if (error || !updated) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update prompt' },
      { status: 500 }
    )
  }

  breakoutLogServer('round-prompt', 'updated', 'live edit', {
    eventId: params.id,
    roundId: params.roundId,
    userId,
    promptLength: prompt?.length ?? 0,
  })

  return NextResponse.json({ round: updated })
}
