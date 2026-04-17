'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { VideoRoom } from '@/components/video-room'
import { Users, Clock, MessageSquare } from 'lucide-react'

interface EventLobbyProps {
  event: any
  rounds: any[]
  user: any
  participantCount: number
  isParticipant: boolean
}

export function EventLobby({
  event: initialEvent,
  rounds,
  user,
  participantCount: initialCount,
  isParticipant: initialIsParticipant,
}: EventLobbyProps) {
  const supabase = useMemo(() => createClient(), [])
  const [event, setEvent] = useState(initialEvent)
  const [participantCount, setParticipantCount] = useState(initialCount)
  const [isParticipant, setIsParticipant] = useState(initialIsParticipant)
  const [rsvpPending, setRsvpPending] = useState(false)
  const [startingEvent, setStartingEvent] = useState(false)
  const [endingEvent, setEndingEvent] = useState(false)
  const [pendingRoundId, setPendingRoundId] = useState<string | null>(null)
  const [currentRoom, setCurrentRoom] = useState<{
    roomName: string
    prompt?: string
    topic?: string
    round: any
  } | null>(null)
  const [activeRound, setActiveRound] = useState<any>(null)
  // Remember round ids the user explicitly left so the fallback poller
  // doesn't yank them back into the video UI. Keyed by round id — once the
  // round ends (status != 'active') the entry becomes a no-op naturally.
  const leftRoundIdsRef = useRef<Set<string>>(new Set())

  const isAdmin = user.is_admin
  const isLive = event.status === 'live'
  const isScheduled = event.status === 'scheduled'
  const isEnded = event.status === 'ended'
  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number)

  // Fallback for realtime races / page reloads during an active round:
  // poll for any active room the user belongs to in this event. The realtime
  // INSERT subscription still handles the fast path, but if the client misses
  // it (subscription not attached in time, websocket hiccup, page reload),
  // this catches them up within a few seconds.
  useEffect(() => {
    if (currentRoom) return
    if (!isLive) return

    let cancelled = false

    async function checkForActiveRoom() {
      const { data: memberships } = await supabase
        .from('neighbors_room_members')
        .select('room_id, neighbors_breakout_rooms!inner(id, livekit_room_name, topic, round_id, neighbors_rounds!inner(id, event_id, status, prompt))')
        .eq('user_id', user.id)
      if (cancelled) return
      const active = memberships?.find((m: any) => {
        const r = m.neighbors_breakout_rooms
        return r?.neighbors_rounds?.event_id === event.id && r?.neighbors_rounds?.status === 'active'
      })
      if (active) {
        const r = (active as any).neighbors_breakout_rooms
        const roundId = r.neighbors_rounds?.id
        if (roundId && leftRoundIdsRef.current.has(roundId)) return
        setCurrentRoom({
          roomName: r.livekit_room_name,
          prompt: r.neighbors_rounds?.prompt,
          topic: r.topic,
          round: r.neighbors_rounds,
        })
      }
    }

    checkForActiveRoom()
    const interval = setInterval(checkForActiveRoom, 3000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [currentRoom, isLive, event.id, user.id, supabase])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`event-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'neighbors_events',
          filter: `id=eq.${event.id}`,
        },
        (payload) => {
          setEvent(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'neighbors_rounds',
          filter: `event_id=eq.${event.id}`,
        },
        (payload) => {
          const round = payload.new
          if (round.status === 'active') {
            setActiveRound(round)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'neighbors_event_participants',
          filter: `event_id=eq.${event.id}`,
        },
        () => setParticipantCount((c) => c + 1)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'neighbors_event_participants',
          filter: `event_id=eq.${event.id}`,
        },
        () => setParticipantCount((c) => Math.max(0, c - 1))
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'neighbors_room_members',
        },
        async (payload) => {
          if (payload.new.user_id === user.id) {
            // We've been assigned to a room
            const { data: room } = await supabase
              .from('neighbors_breakout_rooms')
              .select('*, neighbors_rounds(*)')
              .eq('id', payload.new.room_id)
              .single()

            if (room) {
              setCurrentRoom({
                roomName: room.livekit_room_name,
                prompt: room.neighbors_rounds?.prompt,
                topic: room.topic,
                round: room.neighbors_rounds,
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [event.id, user.id, supabase])

  async function handleStartEvent() {
    if (startingEvent) return
    setStartingEvent(true)
    try {
      const res = await fetch(`/api/events/${event.id}/start`, { method: 'POST' })
      if (!res.ok) {
        toast.error('Failed to start event')
        return
      }
      toast.success('Event started!')
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
      if (!res.ok) {
        toast.error(data?.error || 'Failed to end event', { id: 'end-event' })
        return
      }
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
      toast.success('Breakout rooms created — joining video…')
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

  function handleLeaveRoom() {
    if (currentRoom?.round?.id) {
      leftRoundIdsRef.current.add(currentRoom.round.id)
    }
    setCurrentRoom(null)
  }

  async function handleEndRoundFromVideo() {
    const roundId = currentRoom?.round?.id
    if (!roundId) return
    const res = await fetch(`/api/events/${event.id}/rounds/${roundId}/end`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || 'Failed to end round')
      return
    }
    toast.success('Round ended')
    leftRoundIdsRef.current.add(roundId)
    setCurrentRoom(null)
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
      toast.success('You\'re in — see you at the event!')
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

  // If in a breakout room, show the video room
  if (currentRoom) {
    return (
      <VideoRoom
        roomName={currentRoom.roomName}
        prompt={currentRoom.prompt}
        topic={currentRoom.topic}
        round={currentRoom.round}
        userName={user.display_name || 'Neighbor'}
        onLeave={handleLeaveRoom}
        isAdmin={isAdmin}
        onEndRound={handleEndRoundFromVideo}
      />
    )
  }

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
            <Badge variant={isLive ? 'destructive' : 'secondary'} className="text-sm">
              {isLive ? 'Live' : event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {participantCount} joined
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {sortedRounds.length} rounds
            </span>
          </div>

          {/* Admin controls — shown first so the host can manage the event */}
          {isAdmin && isScheduled && (
            <Button
              onClick={handleStartEvent}
              disabled={startingEvent}
              className="w-full"
            >
              {startingEvent ? 'Starting event…' : 'Start Event'}
            </Button>
          )}

          {isAdmin && isLive && (
            <Button
              variant="destructive"
              onClick={handleEndEvent}
              disabled={endingEvent}
              className="w-full"
            >
              {endingEvent
                ? 'Ending event — processing recordings…'
                : 'End Event & Process Recordings'}
            </Button>
          )}

          {/* RSVP — hosts can also take part in their own event */}
          {!isEnded && !isParticipant && (
            <Button
              onClick={handleRsvp}
              disabled={rsvpPending}
              variant={isAdmin ? 'outline' : 'default'}
              className="w-full"
            >
              {rsvpPending
                ? 'Joining…'
                : isAdmin
                  ? 'Also take part as a participant'
                  : isLive
                    ? 'Join now'
                    : 'RSVP to this event'}
            </Button>
          )}

          {!isEnded && isParticipant && (
            <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                {isLive ? (
                  <span className="text-muted-foreground">
                    Waiting for the {isAdmin ? 'next round to start' : 'host to start the next round'}…
                  </span>
                ) : (
                  <>
                    <span className="font-medium">You&rsquo;re in.</span>{' '}
                    <span className="text-muted-foreground">
                      We&rsquo;ll open the lobby when the host starts the event.
                    </span>
                  </>
                )}
              </p>
              {!isLive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelRsvp}
                  disabled={rsvpPending}
                >
                  {rsvpPending ? 'Leaving…' : 'Leave event'}
                </Button>
              )}
            </div>
          )}

          {isEnded && (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              This event has ended. Check your <a href="/connections" className="underline font-medium">connections</a> for matches!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Program / Run of Show */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedRounds.map((round) => (
            <div
              key={round.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                round.status === 'active' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Round {round.round_number}</span>
                  <Badge variant="outline" className="text-xs">
                    {round.round_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {round.duration_seconds / 60} min
                  </span>
                </div>
                {round.prompt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {round.prompt}
                  </p>
                )}
              </div>
              {isAdmin && isLive && round.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => handleStartRound(round.id)}
                  disabled={!!pendingRoundId}
                >
                  {pendingRoundId === round.id ? 'Starting…' : 'Start'}
                </Button>
              )}
              {isAdmin && isLive && round.status === 'active' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleEndRound(round.id)}
                  disabled={!!pendingRoundId}
                >
                  {pendingRoundId === round.id ? 'Ending…' : 'End Round'}
                </Button>
              )}
              {!isAdmin && round.status === 'active' && (
                <Badge variant="destructive">Active</Badge>
              )}
              {round.status === 'completed' && (
                <Badge variant="secondary">Done</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
