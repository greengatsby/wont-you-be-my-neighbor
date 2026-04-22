'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Zap } from 'lucide-react'

export function StartSessionButton() {
  const router = useRouter()
  const [starting, setStarting] = useState(false)

  async function start() {
    setStarting(true)
    try {
      const res = await fetch('/api/sessions', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to start session')
        return
      }
      router.push(`/events/${data.eventId}/lobby`)
    } finally {
      setStarting(false)
    }
  }

  return (
    <Button onClick={start} disabled={starting} size="lg">
      <Zap className="h-4 w-4 mr-2" />
      {starting ? 'Starting…' : 'Start Session Now'}
    </Button>
  )
}
