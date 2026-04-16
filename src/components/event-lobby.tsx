'use client'

import { useState, useEffect } from 'react'
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
}

export function EventLobby({ event: initialEvent, rounds, user, participantCount: initialCount }: EventLobbyProps) {
  const supabase = createClient()
  const [event, setEvent] = useState(initialEvent)
  const [participantCount, setParticipantCount] = useState(initialCount)
  const [currentRoom, setCurrentRoom] = useState<{
    roomName: string
    prompt?: string
    topic?: string
    round: any
  } | null>(null)
  const [activeRound, setActiveRound] = useState<any>(null)

  const isAdmin = user.is_admin
  const isLive = event.status === 'live'
  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number)

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
    const res = await fetch(`/api/events/${event.id}/start`, { method: 'POST' })
    if (!res.ok) {
      toast.error('Failed to start event')
      return
    }
    toast.success('Event started!')
    setEvent({ ...event, status: 'live' })
  }

  async function handleStartRound(roundId: string) {
    const res = await fetch(`/api/events/${event.id}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId }),
    })

    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || 'Failed to start round')
      return
    }

    toast.success('Breakout rooms created!')
  }

  function handleLeaveRoom() {
    setCurrentRoom(null)
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

          {isAdmin && !isLive && (
            <Button onClick={handleStartEvent} className="w-full">
              Start Event
            </Button>
          )}

          {isLive && !isAdmin && (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              Waiting for the host to start the next round...
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
                >
                  Start
                </Button>
              )}
              {round.status === 'active' && (
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
