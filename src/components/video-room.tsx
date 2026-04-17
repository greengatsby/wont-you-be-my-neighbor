'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MessageSquare, Clock, ArrowLeft } from 'lucide-react'

interface VideoRoomProps {
  roomName: string
  prompt?: string
  topic?: string
  round: any
  userName: string
  onLeave: () => void
  isAdmin?: boolean
  onEndRound?: () => Promise<void> | void
}

export function VideoRoom({
  roomName,
  prompt,
  topic,
  round,
  userName,
  onLeave,
  isAdmin,
  onEndRound,
}: VideoRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [endingRound, setEndingRound] = useState(false)

  // Fetch LiveKit token
  useEffect(() => {
    async function getToken() {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      })

      if (!res.ok) {
        setError('Failed to connect to video room')
        return
      }

      const { token } = await res.json()
      setToken(token)
    }

    getToken()
  }, [roomName])

  // Countdown timer
  useEffect(() => {
    if (!round?.duration_seconds || !round?.started_at) return

    const endTime = new Date(round.started_at).getTime() + round.duration_seconds * 1000
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        // Auto-leave when time's up
        setTimeout(onLeave, 2000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [round, onLeave])

  const handleDisconnected = useCallback(() => {
    onLeave()
  }, [onLeave])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={onLeave}>Back to Lobby</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Connecting to room...</p>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = round?.duration_seconds && timeLeft !== null
    ? ((round.duration_seconds - timeLeft) / round.duration_seconds) * 100
    : 0

  return (
    <div className="space-y-3">
      {/* Info bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Lobby
        </Button>
        <div className="flex items-center gap-3">
          {topic && (
            <Badge variant="outline">{topic}</Badge>
          )}
          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeLeft < 60 ? 'text-destructive font-medium' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          {isAdmin && onEndRound && (
            <Button
              size="sm"
              variant="destructive"
              disabled={endingRound}
              onClick={async () => {
                setEndingRound(true)
                try {
                  await onEndRound()
                } finally {
                  setEndingRound(false)
                }
              }}
            >
              {endingRound ? 'Ending…' : 'End round for everyone'}
            </Button>
          )}
        </div>
      </div>

      {/* Timer progress */}
      {timeLeft !== null && (
        <Progress value={progress} className="h-1" />
      )}

      {/* Prompt */}
      {prompt && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-0.5 text-primary" />
            <p className="text-sm font-medium">{prompt}</p>
          </CardContent>
        </Card>
      )}

      {/* Video room */}
      <div className="rounded-lg overflow-hidden border" style={{ height: 'calc(100vh - 250px)' }}>
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          onDisconnected={handleDisconnected}
          data-lk-theme="default"
          style={{ height: '100%' }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  )
}
