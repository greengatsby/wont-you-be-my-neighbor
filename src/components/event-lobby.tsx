'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { VideoRoom } from '@/components/video-room'
import { HostControls } from '@/components/host-controls'
import { Users, Clock, MessageSquare } from 'lucide-react'

interface EventLobbyProps {
  event: any
  rounds: any[]
  user: any
  participantCount: number
  isParticipant: boolean
}

interface CurrentRoom {
  id: string
  livekit_room_name: string
  room_type: 'main' | 'breakout' | 'adhoc'
  topic?: string | null
  round_id?: string | null
}

export function EventLobby({
  event: initialEvent,
  rounds: initialRounds,
  user,
  participantCount: initialCount,
  isParticipant: initialIsParticipant,
}: EventLobbyProps) {
  const supabase = useMemo(() => createClient(), [])
  const [event, setEvent] = useState(initialEvent)
  const [rounds, setRounds] = useState(initialRounds)
  const [participantCount, setParticipantCount] = useState(initialCount)
  const [isParticipant, setIsParticipant] = useState(initialIsParticipant)
  const [rsvpPending, setRsvpPending] = useState(false)
  const [startingEvent, setStartingEvent] = useState(false)
  const [endingEvent, setEndingEvent] = useState(false)
  const [pendingRoundId, setPendingRoundId] = useState<string | null>(null)
  const [currentRoom, setCurrentRoom] = useState<CurrentRoom | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const endedRoundRef = useRef<string | null>(null)

  const isHost = user.is_admin || user.id === event.host_id
  const isLive = event.status === 'live'
  const isEnded = event.status === 'ended'
  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number)
  const activeRound = sortedRounds.find((r) => r.status === 'active') || null

  // Reconcile the user's current room — runs on mount and whenever their
  // neighbors_room_members rows change.
  const reconcileRoom = useCallback(async () => {
    const { data: membership } = await supabase
      .from('neighbors_room_members')
      .select('room_id, neighbors_rooms!inner(id, livekit_room_name, room_type, topic, round_id, event_id)')
      .eq('user_id', user.id)
      .is('left_at', null)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const room: any = membership?.neighbors_rooms
    if (room && room.event_id === event.id) {
      setCurrentRoom({
        id: room.id,
        livekit_room_name: room.livekit_room_name,
        room_type: room.room_type,
        topic: room.topic,
        round_id: room.round_id,
      })
    } else {
      setCurrentRoom(null)
    }
  }, [supabase, user.id, event.id])

  // Once the user is both live-event participant AND RSVP'd, make sure they
  // have a main-room membership. Hosts are auto-RSVP'd by being host so they
  // also flow through here.
  useEffect(() => {
    if (!isLive) return
    if (!isParticipant && !isHost) return
    let cancelled = false

    async function joinMain() {
      const res = await fetch(`/api/events/${event.id}/join-main`, { method: 'POST' })
      if (cancelled) return
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Failed to join main room:', data.error)
        return
      }
      await reconcileRoom()
    }

    joinMain()
    return () => {
      cancelled = true
    }
  }, [isLive, isParticipant, isHost, event.id, reconcileRoom])

  // Realtime subscriptions.
  useEffect(() => {
    const channel = supabase
      .channel(`event-${event.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'neighbors_events', filter: `id=eq.${event.id}` },
        (payload) => setEvent(payload.new)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'neighbors_rounds', filter: `event_id=eq.${event.id}` },
        (payload) => {
          setRounds((prev) => {
            const next = [...prev]
            const idToMatch = (payload.new as any)?.id || (payload.old as any)?.id
            const i = next.findIndex((r) => r.id === idToMatch)
            if (payload.eventType === 'INSERT') return [...next, payload.new as any]
            if (payload.eventType === 'DELETE' && i >= 0) { next.splice(i, 1); return next }
            if (i >= 0) next[i] = payload.new as any
            else if (payload.new) next.push(payload.new as any)
            return next
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'neighbors_event_participants', filter: `event_id=eq.${event.id}` },
        () => setParticipantCount((c) => c + 1)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'neighbors_event_participants', filter: `event_id=eq.${event.id}` },
        () => setParticipantCount((c) => Math.max(0, c - 1))
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'neighbors_room_members', filter: `user_id=eq.${user.id}` },
        () => { reconcileRoom() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [event.id, user.id, supabase, reconcileRoom])

  // Client-side timer + idempotent auto-end when it hits zero.
  useEffect(() => {
    if (!activeRound?.ends_at) {
      setTimeLeft(null)
      return
    }
    const endMs = new Date(activeRound.ends_at).getTime()

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000))
      setTimeLeft(remaining)

      if (remaining === 0 && endedRoundRef.current !== activeRound.id) {
        endedRoundRef.current = activeRound.id
        fetch(`/api/events/${event.id}/rounds/${activeRound.id}/end`, { method: 'POST' })
          .catch((err) => console.error('Auto-end failed:', err))
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeRound?.id, activeRound?.ends_at, event.id])

  async function handleStartEvent() {
    if (startingEvent) return
    setStartingEvent(true)
    try {
      const res = await fetch(`/api/events/${event.id}/start`, { method: 'POST' })
      if (!res.ok) { toast.error('Failed to start event'); return }
      toast.success('Event started')
      setEvent({ ...event, status: 'live' })
    } finally {
      setStartingEvent(false)
    }
  }

  async function handleEndEvent() {
    if (endingEvent) return
    setEndingEvent(true)
    toast.loading('Ending event and processing recordings…', { id: 'end-event' })
    try {
      const res = await fetch(`/api/events/${event.id}/end`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data?.error || 'Failed to end event', { id: 'end-event' }); return }
      setEvent({ ...event, status: 'ended' })
      toast.success(
        `Event ended — transcribed ${data.transcribed ?? 0} recordings, found ${data.connectionsCreated ?? 0} connections`,
        { id: 'end-event' }
      )
    } finally {
      setEndingEvent(false)
    }
  }

  async function handleStartRound(roundId: string) {
    if (pendingRoundId) return
    setPendingRoundId(roundId)
    try {
      const res = await fetch(`/api/events/${event.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data?.error || 'Failed to start round')
        return
      }
      toast.success('Round started')
    } finally {
      setPendingRoundId(null)
    }
  }

  async function handleEndRound(roundId: string) {
    if (pendingRoundId) return
    setPendingRoundId(roundId)
    try {
      const res = await fetch(`/api/events/${event.id}/rounds/${roundId}/end`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data?.error || 'Failed to end round')
        return
      }
      toast.success('Round ended')
    } finally {
      setPendingRoundId(null)
    }
  }

  async function handleRsvp() {
    if (rsvpPending) return
    setRsvpPending(true)
    setIsParticipant(true)
    setParticipantCount((c) => c + 1)
    const { error } = await supabase
      .from('neighbors_event_participants')
      .upsert(
        { event_id: event.id, user_id: user.id },
        { onConflict: 'event_id,user_id' }
      )
    setRsvpPending(false)
    if (error) {
      setIsParticipant(false)
      setParticipantCount((c) => Math.max(0, c - 1))
      toast.error('Could not RSVP — please try again')
    } else {
      toast.success(isLive ? 'You\'re in — joining now' : 'You\'re in — see you at the event!')
    }
  }

  async function handleCancelRsvp() {
    if (rsvpPending) return
    setRsvpPending(true)
    setIsParticipant(false)
    setParticipantCount((c) => Math.max(0, c - 1))
    const { error } = await supabase
      .from('neighbors_event_participants')
      .delete()
      .eq('event_id', event.id)
      .eq('user_id', user.id)
    setRsvpPending(false)
    if (error) {
      setIsParticipant(true)
      setParticipantCount((c) => c + 1)
      toast.error('Could not leave — please try again')
    } else {
      toast.success('You\'ve left this event')
    }
  }

  const activePrompt = activeRound?.prompt
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ---------------- Render ----------------

  // Ended
  if (isEnded) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription>This event has ended.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              Check your <a href="/connections" className="underline font-medium">connections</a> for matches.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pre-event (scheduled, not started)
  if (!isLive) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription>
                  {event.scheduled_at && format(new Date(event.scheduled_at), 'EEEE, MMMM d \'at\' h:mm a')}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">{event.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && <p className="text-muted-foreground">{event.description}</p>}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{participantCount} joined</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{sortedRounds.length} rounds</span>
            </div>

            {isHost && (
              <Button onClick={handleStartEvent} disabled={startingEvent} className="w-full">
                {startingEvent ? 'Starting event…' : 'Start Event'}
              </Button>
            )}

            {!isParticipant && (
              <Button
                onClick={handleRsvp}
                disabled={rsvpPending}
                variant={isHost ? 'outline' : 'default'}
                className="w-full"
              >
                {rsvpPending ? 'Joining…' : isHost ? 'Also take part as a participant' : 'RSVP to this event'}
              </Button>
            )}

            {isParticipant && (
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-sm">
                  <span className="font-medium">You&rsquo;re in.</span>{' '}
                  <span className="text-muted-foreground">We&rsquo;ll open the lobby when the host starts the event.</span>
                </p>
                <Button variant="outline" size="sm" onClick={handleCancelRsvp} disabled={rsvpPending}>
                  {rsvpPending ? 'Leaving…' : 'Leave'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <ProgramCard rounds={sortedRounds} />
      </div>
    )
  }

  // Live, but viewer hasn't RSVP'd (and isn't host). Offer RSVP first.
  if (!isParticipant && !isHost) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription>This event is live.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && <p className="text-muted-foreground">{event.description}</p>}
            <Button onClick={handleRsvp} disabled={rsvpPending} className="w-full">
              {rsvpPending ? 'Joining…' : 'Join now'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Live — video-first layout
  const inBreakout = currentRoom?.room_type === 'breakout'
  const roomLabel = currentRoom?.room_type === 'main'
    ? 'Main Room'
    : currentRoom?.room_type === 'breakout'
      ? (currentRoom.topic || 'Breakout')
      : (currentRoom?.topic || 'Room')

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <Badge variant={inBreakout ? 'default' : 'secondary'}>{roomLabel}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeLeft < 60 ? 'text-destructive font-medium' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          {isHost && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleEndEvent}
              disabled={endingEvent}
            >
              {endingEvent ? 'Ending…' : 'End Event'}
            </Button>
          )}
        </div>
      </div>

      {inBreakout && activePrompt && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-0.5 text-primary" />
            <p className="text-sm font-medium">{activePrompt}</p>
          </CardContent>
        </Card>
      )}

      <div style={{ height: 'calc(100vh - 280px)', minHeight: 360 }}>
        {currentRoom ? (
          <VideoRoom roomName={currentRoom.livekit_room_name} />
        ) : (
          <Card className="h-full">
            <CardContent className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Connecting to event…
            </CardContent>
          </Card>
        )}
      </div>

      {isHost && (
        <HostControls
          eventId={event.id}
          currentUserId={user.id}
          currentRoomId={currentRoom?.id || null}
        />
      )}

      {isHost && sortedRounds.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Program</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sortedRounds.map((round) => (
              <div
                key={round.id}
                className={`flex items-center justify-between rounded border p-2 ${round.status === 'active' ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Round {round.round_number}</span>
                    <Badge variant="outline" className="text-xs">{round.round_type}</Badge>
                    <span className="text-xs text-muted-foreground">{round.duration_seconds / 60} min</span>
                  </div>
                  {round.prompt && <p className="text-xs text-muted-foreground">{round.prompt}</p>}
                </div>
                {round.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleStartRound(round.id)}
                    disabled={!!pendingRoundId}
                  >
                    {pendingRoundId === round.id ? 'Starting…' : 'Start'}
                  </Button>
                )}
                {round.status === 'active' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleEndRound(round.id)}
                    disabled={!!pendingRoundId}
                  >
                    {pendingRoundId === round.id ? 'Ending…' : 'End Round'}
                  </Button>
                )}
                {round.status === 'completed' && <Badge variant="secondary">Done</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ProgramCard({ rounds }: { rounds: any[] }) {
  if (!rounds.length) return null
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Program</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rounds.map((round) => (
          <div key={round.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Round {round.round_number}</span>
                <Badge variant="outline" className="text-xs">{round.round_type}</Badge>
                <span className="text-xs text-muted-foreground">{round.duration_seconds / 60} min</span>
              </div>
              {round.prompt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />{round.prompt}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
