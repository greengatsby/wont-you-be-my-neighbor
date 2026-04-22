'use client'

import { useState, useEffect } from 'react'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Card, CardContent } from '@/components/ui/card'

interface VideoRoomProps {
  roomName: string
}

export function VideoRoom({ roomName }: VideoRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setToken(null)
    setError(null)

    async function getToken() {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      })

      if (cancelled) return

      if (!res.ok) {
        setError('Failed to connect to video room')
        return
      }

      const { token } = await res.json()
      if (!cancelled) setToken(token)
    }

    getToken()
    return () => {
      cancelled = true
    }
  }, [roomName])

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Connecting…
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border h-full">
      <LiveKitRoom
        key={roomName}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
