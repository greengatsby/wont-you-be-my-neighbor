'use client'

import { useEffect } from 'react'
import { logEventClient } from '@/lib/pipeline-logger-client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logEventClient({
      pipeline: 'client.error.unhandled',
      level: 'error',
      message: error.message,
      error: { message: error.message, stack: error.stack || null },
      metadata: {
        digest: error.digest || null,
        path: typeof window !== 'undefined' ? window.location.pathname : null,
      },
    })
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              {error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-md bg-black text-white text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
