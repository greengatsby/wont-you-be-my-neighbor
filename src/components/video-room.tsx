'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { breakoutLogClient, breakoutLogClientError } from '@/lib/breakout-debug-log'
import {
  ConnectionStateToast,
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useSpeakingParticipants,
  useTracks,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
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
      breakoutLogClient('video', 'token_fetch', 'start', { roomName })
      try {
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName }),
        })

        if (cancelled) return

        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          breakoutLogClient('video', 'token_fetch', 'http_error', {
            roomName,
            status: res.status,
            error: (body as { error?: string }).error,
          })
          setError('Failed to connect to video room')
          return
        }
        const token = (body as { token?: string }).token
        if (token) {
          breakoutLogClient('video', 'token_fetch', 'ok', { roomName })
          if (!cancelled) setToken(token)
        } else {
          breakoutLogClient('video', 'token_fetch', 'missing_token', { roomName })
          setError('Failed to connect to video room')
        }
      } catch (e) {
        breakoutLogClientError('video.token_fetch', 'token fetch threw', e, { roomName })
        if (!cancelled) setError('Failed to connect to video room')
      }
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
    <div
      className="rounded-lg overflow-hidden border h-full flex flex-col bg-black"
      data-lk-theme="default"
    >
      <LiveKitRoom
        key={roomName}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect
        video
        audio
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div className="flex-1 min-h-0">
          <SpotlightLayout />
        </div>
        <ControlBar
          variation="minimal"
          controls={{ chat: false, screenShare: true, leave: true }}
        />
        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </div>
  )
}

function SpotlightLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )
  const speakers = useSpeakingParticipants()
  const [stickySpeakerId, setStickySpeakerId] = useState<string | null>(null)

  const cameraTracks = useMemo(
    () => tracks.filter((t) => t.source === Track.Source.Camera),
    [tracks],
  )
  const screenShareTrack = useMemo(
    () => tracks.find((t) => t.source === Track.Source.ScreenShare) ?? null,
    [tracks],
  )

  const topSpeakerId = useMemo(() => {
    if (speakers.length === 0) return null
    const ids = new Set(cameraTracks.map((t) => t.participant.identity))
    return speakers.find((p) => ids.has(p.identity))?.identity ?? null
  }, [speakers, cameraTracks])

  useEffect(() => {
    if (topSpeakerId) setStickySpeakerId(topSpeakerId)
  }, [topSpeakerId])

  if (cameraTracks.length === 0 && !screenShareTrack) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Waiting for video…
      </div>
    )
  }

  // Screen share always wins the spotlight when present.
  let spotlight: TrackReferenceOrPlaceholder | null = null
  let others: TrackReferenceOrPlaceholder[] = cameraTracks

  if (screenShareTrack) {
    spotlight = screenShareTrack
  } else if (cameraTracks.length === 1) {
    spotlight = cameraTracks[0]
    others = []
  } else {
    const activeIdx = stickySpeakerId
      ? cameraTracks.findIndex((t) => t.participant.identity === stickySpeakerId)
      : -1
    if (activeIdx !== -1) {
      spotlight = cameraTracks[activeIdx]
      others = cameraTracks.filter((_, i) => i !== activeIdx)
    }
  }

  const isLive = topSpeakerId !== null && spotlight?.participant.identity === topSpeakerId

  // Fallback: no spotlight yet → even grid
  if (!spotlight) {
    const cols = Math.min(3, cameraTracks.length)
    return (
      <div
        className="grid gap-1 h-full p-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cameraTracks.map((t) => (
          <PortraitSafeTile key={tileKey(t)} trackRef={t} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-1 p-1">
      <div className="flex-1 min-h-0">
        <PortraitSafeTile trackRef={spotlight} highlight={isLive} />
      </div>
      {others.length > 0 && (
        <div className="flex gap-1 shrink-0 h-[22%] min-h-[80px] overflow-x-auto">
          {others.map((t) => (
            <div key={tileKey(t)} className="relative shrink-0 aspect-video h-full">
              <PortraitSafeTile trackRef={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function tileKey(trackRef: TrackReferenceOrPlaceholder) {
  return `${trackRef.participant.identity}-${trackRef.source}`
}

function PortraitSafeTile({
  trackRef,
  highlight = false,
}: {
  trackRef: TrackReferenceOrPlaceholder
  highlight?: boolean
}) {
  return (
    <div
      className={`lk-portrait-safe relative w-full h-full overflow-hidden rounded-md bg-black transition-shadow ${
        highlight ? 'ring-2 ring-primary ring-inset' : ''
      }`}
    >
      <BackdropVideo trackRef={trackRef} />
      <div className="relative h-full">
        <ParticipantTile trackRef={trackRef} />
      </div>
    </div>
  )
}

function BackdropVideo({ trackRef }: { trackRef: TrackReferenceOrPlaceholder }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const track = trackRef.publication?.track
  useEffect(() => {
    const el = videoRef.current
    if (!el || !track) return
    track.attach(el)
    return () => {
      track.detach(el)
    }
  }, [track])
  if (!track) return null
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      aria-hidden
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      style={{
        transform: 'scale(1.15)',
        filter: 'blur(32px) brightness(0.55)',
      }}
    />
  )
}
