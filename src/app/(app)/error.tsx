'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { logEventClient } from '@/lib/pipeline-logger-client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logEventClient({
      pipeline: 'client.error.app',
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
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
