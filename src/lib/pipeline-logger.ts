import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface PipelineLogInit {
  pipeline: string
  entityId?: string | null
  entityType?: string | null
  userId?: string | null
  route?: string | null
  method?: string | null
  inputContext?: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * Server-side pipeline logger. Writes to `neighbors_pipeline_logs` via the
 * service role key (bypasses RLS). Every write is wrapped in try/catch so a
 * broken logger never takes down a real request.
 */
export class PipelineLogger {
  private id: string | null = null
  private runId: string | null = null
  private startTime: number
  private stepTimings: Record<string, { start: number; end?: number; duration_ms?: number }> = {}
  private logMessages: string[] = []
  private supabase: SupabaseClient

  constructor(public data: PipelineLogInit) {
    this.startTime = Date.now()
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  }

  get logId() {
    return this.id
  }
  get logRunId() {
    return this.runId
  }

  async init(): Promise<void> {
    try {
      const { data: row, error } = await this.supabase
        .from('neighbors_pipeline_logs')
        .insert({
          pipeline: this.data.pipeline,
          entity_id: this.data.entityId || null,
          entity_type: this.data.entityType || null,
          user_id: this.data.userId || null,
          route: this.data.route || null,
          method: this.data.method || null,
          input_context: this.data.inputContext || {},
          metadata: this.data.metadata || {},
          status: 'started',
          current_step: 'init',
          started_at: new Date().toISOString(),
        })
        .select('id, run_id')
        .single()

      if (error) {
        console.warn(`[PipelineLogger:${this.data.pipeline}] init failed:`, error.message)
        return
      }
      this.id = row.id
      this.runId = row.run_id
    } catch (e) {
      console.warn(`[PipelineLogger:${this.data.pipeline}] init error:`, e)
    }
  }

  /** Attach to an existing run_id — useful for correlating multi-step flows. */
  async initFromRunId(runId: string): Promise<void> {
    this.runId = runId
    try {
      const { data: row, error } = await this.supabase
        .from('neighbors_pipeline_logs')
        .insert({
          run_id: runId,
          pipeline: this.data.pipeline,
          entity_id: this.data.entityId || null,
          entity_type: this.data.entityType || null,
          user_id: this.data.userId || null,
          route: this.data.route || null,
          method: this.data.method || null,
          input_context: this.data.inputContext || {},
          metadata: this.data.metadata || {},
          status: 'started',
          current_step: 'init',
          started_at: new Date().toISOString(),
        })
        .select('id, run_id')
        .single()
      if (error) {
        console.warn(`[PipelineLogger:${this.data.pipeline}] init-from-run failed:`, error.message)
        return
      }
      this.id = row.id
    } catch (e) {
      console.warn(`[PipelineLogger:${this.data.pipeline}] init-from-run error:`, e)
    }
  }

  log(message: string): void {
    const timestamp = new Date().toISOString().split('T')[1].replace('Z', '')
    this.logMessages.push(`[${timestamp}] ${message}`)
  }

  startStep(step: string): void {
    this.stepTimings[step] = { start: Date.now() }
    this.log(`Step started: ${step}`)
  }

  endStep(step: string): void {
    const s = this.stepTimings[step]
    if (s) {
      s.end = Date.now()
      s.duration_ms = s.end - s.start
      this.log(`Step completed: ${step} (${s.duration_ms}ms)`)
    }
  }

  async update(
    fields: Partial<{
      status: string
      level: string
      current_step: string
      metadata: Record<string, any>
      output_context: Record<string, any>
    }> = {}
  ): Promise<void> {
    if (!this.id) return
    try {
      await this.supabase
        .from('neighbors_pipeline_logs')
        .update({
          ...fields,
          step_timings: this.stepTimings,
          logs: this.logMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.id)
    } catch (e) {
      console.warn(`[PipelineLogger:${this.data.pipeline}] update error:`, e)
    }
  }

  async complete(
    fields: Partial<{
      metadata: Record<string, any>
      output_context: Record<string, any>
    }> = {}
  ): Promise<void> {
    if (!this.id) return
    const now = Date.now()
    this.log('Pipeline completed')
    try {
      await this.supabase
        .from('neighbors_pipeline_logs')
        .update({
          ...fields,
          status: 'completed',
          current_step: 'done',
          completed_at: new Date().toISOString(),
          duration_ms: now - this.startTime,
          step_timings: this.stepTimings,
          logs: this.logMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.id)
    } catch (e) {
      console.warn(`[PipelineLogger:${this.data.pipeline}] complete error:`, e)
    }
  }

  async fail(error: any, extra: { metadata?: Record<string, any> } = {}): Promise<void> {
    if (!this.id) return
    const now = Date.now()
    const errorMessage = error?.message || String(error)
    this.log(`Pipeline failed: ${errorMessage}`)
    try {
      await this.supabase
        .from('neighbors_pipeline_logs')
        .update({
          status: 'failed',
          level: 'error',
          current_step: 'failed',
          error_message: errorMessage,
          error_stack: error?.stack || null,
          completed_at: new Date().toISOString(),
          duration_ms: now - this.startTime,
          step_timings: this.stepTimings,
          logs: this.logMessages,
          metadata: extra.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.id)
    } catch (e) {
      console.warn(`[PipelineLogger:${this.data.pipeline}] fail error:`, e)
    }
  }
}

/**
 * One-shot convenience for simple events — writes a single completed (or failed)
 * row without the init/update dance. Use for ad-hoc observability ("user joined
 * main room", "egress started", "auth redirect").
 */
export async function logEvent(
  opts: PipelineLogInit & {
    status?: 'completed' | 'failed' | 'started'
    level?: 'debug' | 'info' | 'warn' | 'error'
    message?: string
    outputContext?: Record<string, any>
    error?: any
  }
): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    const status = opts.status || (opts.error ? 'failed' : 'completed')
    await supabase.from('neighbors_pipeline_logs').insert({
      pipeline: opts.pipeline,
      entity_id: opts.entityId || null,
      entity_type: opts.entityType || null,
      user_id: opts.userId || null,
      route: opts.route || null,
      method: opts.method || null,
      input_context: opts.inputContext || {},
      output_context: opts.outputContext || {},
      metadata: opts.metadata || {},
      status,
      level: opts.level || (opts.error ? 'error' : 'info'),
      logs: opts.message ? [opts.message] : [],
      error_message: opts.error ? opts.error.message || String(opts.error) : null,
      error_stack: opts.error?.stack || null,
      completed_at: status === 'started' ? null : new Date().toISOString(),
    })
  } catch (e) {
    console.warn(`[logEvent:${opts.pipeline}] error:`, e)
  }
}
