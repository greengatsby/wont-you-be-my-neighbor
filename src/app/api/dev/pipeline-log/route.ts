import { NextResponse } from 'next/server'
import { PipelineLogger, logEvent } from '@/lib/pipeline-logger'
import { createClient } from '@/utils/supabase/server'

/**
 * Fire-and-forget proxy so client components can write to pipeline_logs
 * without exposing the Supabase service role key.
 *
 * Actions: init, update, complete, fail, event (one-shot).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data, logId, steps, messages, fields, error: errorData } = body

    // Attach the current user id to writes — the client never sets this itself.
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: auth } = await supabase.auth.getUser()
      userId = auth.user?.id ?? null
    } catch {}

    if (action === 'event') {
      await logEvent({
        pipeline: body.pipeline,
        entityId: body.entityId,
        entityType: body.entityType,
        userId,
        level: body.level,
        message: body.message,
        metadata: body.metadata,
        error: body.error,
      })
      return NextResponse.json({ ok: true })
    }

    if (action === 'init') {
      const logger = new PipelineLogger({ ...data, userId: data?.userId ?? userId })
      await logger.init()
      return NextResponse.json({ id: logger.logId, runId: logger.logRunId })
    }

    if (!logId) {
      return NextResponse.json({ error: 'logId required' }, { status: 400 })
    }

    const logger = new PipelineLogger(data || { pipeline: 'proxy' })
    ;(logger as any).id = logId
    if (body.runId) (logger as any).runId = body.runId
    if (messages?.length) {
      for (const msg of messages) logger.log(msg)
    }
    if (steps) {
      ;(logger as any).stepTimings = steps
    }

    if (action === 'update') {
      await logger.update(fields || {})
    } else if (action === 'complete') {
      await logger.complete(fields || {})
    } else if (action === 'fail') {
      await logger.fail(errorData || 'Unknown error')
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[pipeline-log route]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
