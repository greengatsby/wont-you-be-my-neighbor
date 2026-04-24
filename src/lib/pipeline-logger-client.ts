import type { PipelineLogInit } from './pipeline-logger'

/**
 * Client-side PipelineLogger. Proxies writes through /api/dev/pipeline-log so
 * the browser never sees the Supabase service role key. Fire-and-forget on
 * updates — never blocks the UI.
 */
export class PipelineLoggerClient {
  private id: string | null = null
  private runId: string | null = null
  private startTime: number
  private stepTimings: Record<string, { start: number; end?: number; duration_ms?: number }> = {}
  private logMessages: string[] = []

  constructor(public data: PipelineLogInit) {
    this.startTime = Date.now()
  }

  get logId() {
    return this.id
  }
  get logRunId() {
    return this.runId
  }

  private fire(body: Record<string, any>) {
    fetch('/api/dev/pipeline-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  }

  async init(): Promise<void> {
    try {
      const res = await fetch('/api/dev/pipeline-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init', data: this.data }),
      })
      const json = await res.json()
      this.id = json.id ?? null
      this.runId = json.runId ?? null
    } catch {
      // silent
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

  async update(fields: Partial<{ status: string; current_step: string; metadata: Record<string, any>; output_context: Record<string, any> }>): Promise<void> {
    if (!this.id) return
    this.fire({
      action: 'update',
      logId: this.id,
      runId: this.runId,
      data: this.data,
      steps: this.stepTimings,
      messages: this.logMessages,
      fields,
    })
  }

  async complete(fields: Partial<{ metadata: Record<string, any>; output_context: Record<string, any> }> = {}): Promise<void> {
    if (!this.id) return
    this.log('Pipeline completed')
    this.fire({
      action: 'complete',
      logId: this.id,
      runId: this.runId,
      data: this.data,
      steps: this.stepTimings,
      messages: this.logMessages,
      fields,
    })
  }

  async fail(error: any): Promise<void> {
    if (!this.id) return
    const errorMessage = error?.message || String(error)
    this.log(`Pipeline failed: ${errorMessage}`)
    this.fire({
      action: 'fail',
      logId: this.id,
      runId: this.runId,
      data: this.data,
      steps: this.stepTimings,
      messages: this.logMessages,
      error: { message: errorMessage, stack: error?.stack || null },
    })
  }
}

/**
 * One-shot client-side event logger. Fires a single write via the proxy.
 */
export function logEventClient(opts: {
  pipeline: string
  entityId?: string | null
  entityType?: string | null
  level?: 'debug' | 'info' | 'warn' | 'error'
  message?: string
  metadata?: Record<string, any>
  error?: { message: string; stack?: string | null }
}): void {
  fetch('/api/dev/pipeline-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'event', ...opts }),
    keepalive: true,
  }).catch(() => {})
}
