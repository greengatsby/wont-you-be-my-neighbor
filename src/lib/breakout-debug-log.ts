/**
 * One-line, grep-friendly logs for breakout / room moves / LiveKit.
 * Filter: [neighbors/breakout]   (browser DevTools or Vercel/server console)
 */
export const BREAKOUT_LOG_PREFIX = '[neighbors/breakout]' as const

type BreakoutScope = 'server' | 'client'
type Ctx = Record<string, unknown>

function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

function line(
  scope: BreakoutScope,
  phase: string,
  message: string,
  ctx: Ctx = {}
): string {
  return JSON.stringify({
    t: new Date().toISOString(),
    scope,
    phase,
    msg: message,
    ...ctx,
  })
}

function lineServer(phase: string, message: string, ctx: Ctx = {}): void {
  // eslint-disable-next-line no-console -- intentional debug stream
  console.log(BREAKOUT_LOG_PREFIX, line('server', phase, message, ctx))
}

function lineClient(phase: string, message: string, ctx: Ctx = {}): void {
  // eslint-disable-next-line no-console -- intentional debug stream
  console.log(BREAKOUT_LOG_PREFIX, line('client', phase, message, ctx))
}

/**
 * 2-arg: (phase, message)
 * 3-arg: (phase, message, ctx)
 * 4-arg: (phase, step, message, ctx) — merged to msg "step — message"
 */
export function breakoutLogServer(phase: string, a: string, b?: string | Ctx, c?: Ctx): void {
  if (b === undefined) {
    return lineServer(phase, a, {})
  }
  if (typeof b === 'string') {
    if (c !== undefined) {
      return lineServer(phase, `${a} — ${b}`, c)
    }
    return lineServer(phase, `${a} — ${b}`, {})
  }
  return lineServer(phase, a, b as Ctx)
}

/** Server: include a caught error as a string (safe to paste). */
export function breakoutLogServerError(
  phase: string,
  message: string,
  err: unknown,
  ctx: Ctx = {}
): void {
  lineServer(phase, message, { ...ctx, error: serializeError(err) })
}

/** Same overload shape as `breakoutLogServer`. */
export function breakoutLogClient(phase: string, a: string, b?: string | Ctx, c?: Ctx): void {
  if (b === undefined) {
    return lineClient(phase, a, {})
  }
  if (typeof b === 'string') {
    if (c !== undefined) {
      return lineClient(phase, `${a} — ${b}`, c)
    }
    return lineClient(phase, `${a} — ${b}`, {})
  }
  return lineClient(phase, a, b as Ctx)
}

export function breakoutLogClientError(phase: string, message: string, err: unknown, ctx: Ctx = {}): void {
  lineClient(phase, message, { ...ctx, error: serializeError(err) })
}
