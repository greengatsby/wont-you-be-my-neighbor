'use client'

import { useEffect, useState } from 'react'
import { breakoutLogClient, breakoutLogClientError } from '@/lib/breakout-debug-log'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogIn, Users, Volume2, VolumeX } from 'lucide-react'

interface MonitorTileProps {
  roomId: string
  roomName: string
  topic: string | null
  memberNames: string[]
  onJumpIn: () => void
}

export function MonitorTile({
  roomId,
  roomName,
  topic,
  memberNames,
  onJumpIn,
}: MonitorTileProps) {
  const [token, setToken] = useState<string | null>(null)
  const [audioOn, setAudioOn] = useState(false)

  useEffect(() => {
    let cancelled = false
    setToken(null)
    breakoutLogClient('monitor', 'token_fetch', 'start', { roomName, roomId })
    fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, mode: 'monitor' }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (cancelled) return
        if (r.ok && (data as { token?: string }).token) {
          breakoutLogClient('monitor', 'token_fetch', 'ok', { roomName, roomId })
          setToken((data as { token: string }).token)
        } else {
          breakoutLogClient('monitor', 'token_fetch', 'http_error', {
            roomName,
            roomId,
            status: r.status,
            error: (data as { error?: string }).error,
          })
        }
      })
      .catch((e) => {
        if (!cancelled) breakoutLogClientError('monitor.token_fetch', 'token fetch threw', e, { roomName, roomId })
      })
    return () => {
      cancelled = true
    }
  }, [roomName, roomId])

  return (
    <div className="rounded-lg border bg-card overflow-hidden flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b">
        <div className="flex items-center gap-2 min-w-0">
          {topic ? (
            <span className="text-sm font-medium truncate">{topic}</span>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">Breakout</span>
          )}
          <Badge variant="outline" className="text-xs gap-1 shrink-0">
            <Users className="h-3 w-3" /> {memberNames.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setAudioOn((v) => !v)}
            title={audioOn ? 'Mute' : 'Listen'}
          >
            {audioOn ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button size="sm" variant="ghost" className="h-7" onClick={onJumpIn}>
            <LogIn className="h-3 w-3 mr-1" /> Join
          </Button>
        </div>
      </div>
      <div className="relative flex-1 min-h-[160px] bg-black">
        {token ? (
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect
            audio={false}
            video={false}
            style={{ height: '100%' }}
          >
            <MonitorVideoLayer />
            {audioOn && <RoomAudioRenderer />}
          </LiveKitRoom>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            Connecting…
          </div>
        )}
      </div>
      <div className="px-3 py-1.5 text-[11px] text-muted-foreground truncate border-t">
        {memberNames.length > 0 ? memberNames.join(', ') : 'empty'}
      </div>
    </div>
  )
}

function MonitorVideoLayer() {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  )

  const visible = tracks.filter((t) => !t.participant.isLocal)

  if (visible.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
        No video yet
      </div>
    )
  }

  const cols = Math.min(2, visible.length)

  return (
    <div
      className="grid gap-0.5 h-full"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {visible.map((trackRef) => (
        <div
          key={`${trackRef.participant.identity}-${trackRef.source}`}
          className="relative bg-black overflow-hidden"
        >
          {trackRef.publication ? (
            <VideoTrack
              trackRef={trackRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              {trackRef.participant.name || 'Camera off'}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
