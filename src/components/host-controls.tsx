'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Home, Users, Plus, MoreHorizontal, LogIn, Shuffle, Check, MessageSquare } from 'lucide-react'
import { breakoutLogClient } from '@/lib/breakout-debug-log'

interface RoomMember {
  user_id: string
  role: 'participant' | 'host'
  left_at: string | null
  neighbors_users: { id: string; display_name: string | null } | null
}

interface RoomWithMembers {
  id: string
  livekit_room_name: string
  room_type: 'main' | 'breakout' | 'adhoc'
  topic: string | null
  neighbors_room_members: RoomMember[]
}

interface HostControlsProps {
  eventId: string
  currentUserId: string
  currentRoomId: string | null
  activeRoundId: string | null
  activeRoundPrompt: string | null
}

export function HostControls({
  eventId,
  currentUserId,
  currentRoomId,
  activeRoundId,
  activeRoundPrompt,
}: HostControlsProps) {
  const supabase = useMemo(() => createClient(), [])
  const [rooms, setRooms] = useState<RoomWithMembers[]>([])
  const [pairing, setPairing] = useState(false)
  const hasActiveRound = activeRoundId !== null

  // Live prompt editor — shown while a round is active so the host can
  // change the prompt on the fly. Participants re-render from the realtime
  // subscription on neighbors_rounds.
  const [livePrompt, setLivePrompt] = useState(activeRoundPrompt ?? '')
  const [livePromptDirty, setLivePromptDirty] = useState(false)
  const [savingLivePrompt, setSavingLivePrompt] = useState(false)

  // Sync editor from props unless the host is mid-edit, so a concurrent
  // update from elsewhere can land without clobbering unsaved text.
  useEffect(() => {
    if (!livePromptDirty) {
      setLivePrompt(activeRoundPrompt ?? '')
    }
  }, [activeRoundId, activeRoundPrompt, livePromptDirty])

  // Reset when the round ends.
  useEffect(() => {
    if (!activeRoundId) {
      setLivePromptDirty(false)
      setLivePrompt('')
    }
  }, [activeRoundId])

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from('neighbors_rooms')
      .select(`
        id, livekit_room_name, room_type, topic,
        neighbors_room_members(
          user_id, role, left_at,
          neighbors_users:user_id(id, display_name)
        )
      `)
      .eq('event_id', eventId)

    setRooms((data as any[]) || [])
  }, [supabase, eventId])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel(`host-controls-${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'neighbors_rooms', filter: `event_id=eq.${eventId}` },
        () => refetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'neighbors_room_members' },
        () => refetch()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refetch, supabase, eventId])

  // Safety net for realtime reliability: when a new round starts, the burst
  // of room/member INSERTs can race with realtime delivery. Force a refetch
  // on round change plus a short re-poll.
  useEffect(() => {
    if (!activeRoundId) return
    refetch()
    const retry = setTimeout(refetch, 1500)
    return () => clearTimeout(retry)
  }, [activeRoundId, refetch])

  async function returnAll() {
    breakoutLogClient('return_all', 'request', 'POST return-to-main', { eventId })
    const res = await fetch(`/api/events/${eventId}/return-to-main`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      breakoutLogClient('return_all', 'response_error', 'failed', {
        eventId,
        status: res.status,
        error: (data as { error?: string }).error,
      })
      toast.error((data as { error?: string }).error || 'Failed to return to main')
      return
    }
    breakoutLogClient('return_all', 'response_ok', 'ok', {
      eventId,
      moved: (data as { moved?: number }).moved,
    })
    toast.success('Pulled everyone back to main')
  }

  async function pairEveryone() {
    if (pairing) return
    setPairing(true)
    breakoutLogClient('pair_everyone', 'request', 'POST pair-everyone', { eventId })
    try {
      const res = await fetch(`/api/events/${eventId}/pair-everyone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        breakoutLogClient('pair_everyone', 'response_error', 'failed', {
          eventId,
          status: res.status,
          error: (data as { error?: string }).error,
        })
        toast.error((data as { error?: string }).error || 'Failed to start breakouts')
        return
      }
      const rooms = (data as { rooms?: { id: string }[] }).rooms
      breakoutLogClient('pair_everyone', 'response_ok', 'ok', {
        eventId,
        roomCount: rooms?.length ?? 0,
        roundId: (data as { round?: { id: string } }).round?.id,
      })
      toast.success(`Opened ${rooms?.length ?? 0} breakout rooms`)
    } finally {
      setPairing(false)
    }
  }

  async function saveLivePrompt() {
    if (!activeRoundId || savingLivePrompt) return
    setSavingLivePrompt(true)
    const trimmed = livePrompt.trim()
    breakoutLogClient('live_prompt', 'request', 'PATCH round prompt', {
      eventId,
      roundId: activeRoundId,
      promptLength: trimmed.length,
    })
    try {
      const res = await fetch(
        `/api/events/${eventId}/rounds/${activeRoundId}/prompt`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: trimmed }),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        breakoutLogClient('live_prompt', 'response_error', 'failed', {
          eventId,
          roundId: activeRoundId,
          status: res.status,
          error: (data as { error?: string }).error,
        })
        toast.error((data as { error?: string }).error || 'Failed to update prompt')
        return
      }
      breakoutLogClient('live_prompt', 'response_ok', 'ok', {
        eventId,
        roundId: activeRoundId,
      })
      setLivePromptDirty(false)
      toast.success(trimmed.length > 0 ? 'Prompt updated' : 'Prompt cleared')
    } finally {
      setSavingLivePrompt(false)
    }
  }

  async function createAdhoc() {
    const topic = window.prompt('Topic for new room (optional):')
    if (topic === null) return // cancelled
    breakoutLogClient('adhoc_room', 'request', 'POST new room', { eventId, hasTopic: Boolean(topic) })
    const res = await fetch(`/api/events/${eventId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic ? { topic } : {}),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      breakoutLogClient('adhoc_room', 'response_error', 'failed', {
        eventId,
        status: res.status,
        error: (data as { error?: string }).error,
      })
      toast.error((data as { error?: string }).error || 'Failed to create room')
      return
    }
    breakoutLogClient('adhoc_room', 'response_ok', 'ok', { eventId })
    toast.success('Room created')
  }

  async function moveUser(userId: string, targetRoomId: string) {
    breakoutLogClient('move_user', 'request', 'host reassign', { eventId, userId, targetRoomId })
    const res = await fetch(`/api/events/${eventId}/rooms/${targetRoomId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: [userId] }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      breakoutLogClient('move_user', 'response_error', 'failed', {
        eventId,
        targetRoomId,
        status: res.status,
        error: (data as { error?: string }).error,
      })
      toast.error((data as { error?: string }).error || 'Failed to move participant')
    } else {
      breakoutLogClient('move_user', 'response_ok', 'ok', { eventId, targetRoomId })
    }
  }

  const jumpIn = (roomId: string) => moveUser(currentUserId, roomId)

  const activeMembers = (room: RoomWithMembers) =>
    room.neighbors_room_members.filter((m) => m.left_at === null)

  // Hide stale breakouts (rows from completed rounds that sit around
  // empty). Main and adhoc stay visible regardless so the host can still
  // jump in / see just-created empty rooms.
  const sortedRooms = [...rooms]
    .filter((r) => r.room_type !== 'breakout' || activeMembers(r).length > 0)
    .sort((a, b) => {
      const order = { main: 0, breakout: 1, adhoc: 2 } as const
      return order[a.room_type] - order[b.room_type]
    })

  const hasBreakoutOccupants = rooms.some(
    (r) => r.room_type === 'breakout' && activeMembers(r).length > 0
  )

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Host Controls</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={createAdhoc}>
            <Plus className="h-4 w-4 mr-1" /> New Room
          </Button>
          {!hasActiveRound && (
            <Button size="sm" onClick={pairEveryone} disabled={pairing}>
              <Shuffle className="h-4 w-4 mr-1" />
              {pairing ? 'Pairing…' : 'Pair Everyone'}
            </Button>
          )}
          {hasBreakoutOccupants && (
            <Button size="sm" variant="secondary" onClick={returnAll}>
              <Home className="h-4 w-4 mr-1" /> Return All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasActiveRound && (
          <div className="rounded border p-3 space-y-2 bg-primary/5 border-primary/20">
            <div className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-primary" />
                Live prompt
              </p>
              <p className="text-xs text-muted-foreground">
                Edit the prompt for the active round. Participants see the change instantly.
              </p>
            </div>
            <Textarea
              placeholder="What should neighbors talk about right now?"
              value={livePrompt}
              onChange={(e) => {
                setLivePrompt(e.target.value)
                setLivePromptDirty(true)
              }}
              rows={3}
              disabled={savingLivePrompt}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={saveLivePrompt}
                disabled={savingLivePrompt || !livePromptDirty}
              >
                <Check className="h-4 w-4 mr-1" />
                {savingLivePrompt
                  ? 'Saving…'
                  : livePromptDirty
                    ? 'Push to rooms'
                    : 'Saved'}
              </Button>
              {livePromptDirty && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setLivePrompt(activeRoundPrompt ?? '')
                    setLivePromptDirty(false)
                  }}
                  disabled={savingLivePrompt}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
        {sortedRooms.map((room) => {
          const members = activeMembers(room)
          return (
            <div key={room.id} className="rounded border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={room.room_type === 'main' ? 'default' : 'outline'}>
                    {room.room_type}
                  </Badge>
                  {room.topic && <span className="text-sm font-medium">{room.topic}</span>}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />{members.length}
                  </span>
                </div>
                {room.id !== currentRoomId && (
                  <Button size="sm" variant="ghost" onClick={() => jumpIn(room.id)}>
                    <LogIn className="h-4 w-4 mr-1" /> Jump in
                  </Button>
                )}
              </div>
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">empty</p>
              ) : (
                <ul className="space-y-1">
                  {members.map((m) => (
                    <li key={m.user_id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {m.neighbors_users?.display_name || 'Neighbor'}
                        {m.role === 'host' && (
                          <Badge variant="secondary" className="text-[10px] h-4">host</Badge>
                        )}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {sortedRooms
                            .filter((r) => r.id !== room.id)
                            .map((r) => (
                              <DropdownMenuItem
                                key={r.id}
                                onClick={() => moveUser(m.user_id, r.id)}
                              >
                                Move to {r.room_type === 'main' ? 'Main' : (r.topic || r.room_type)}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
