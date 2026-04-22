'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Home, Users, Plus, MoreHorizontal, LogIn } from 'lucide-react'

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
}

export function HostControls({ eventId, currentUserId, currentRoomId }: HostControlsProps) {
  const supabase = useMemo(() => createClient(), [])
  const [rooms, setRooms] = useState<RoomWithMembers[]>([])

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

  async function returnAll() {
    const res = await fetch(`/api/events/${eventId}/return-to-main`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Failed to return to main')
      return
    }
    toast.success('Pulled everyone back to main')
  }

  async function createAdhoc() {
    const topic = window.prompt('Topic for new room (optional):')
    if (topic === null) return // cancelled
    const res = await fetch(`/api/events/${eventId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic ? { topic } : {}),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Failed to create room')
      return
    }
    toast.success('Room created')
  }

  async function moveUser(userId: string, targetRoomId: string) {
    const res = await fetch(`/api/events/${eventId}/rooms/${targetRoomId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: [userId] }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Failed to move participant')
    }
  }

  const jumpIn = (roomId: string) => moveUser(currentUserId, roomId)

  const sortedRooms = [...rooms].sort((a, b) => {
    const order = { main: 0, breakout: 1, adhoc: 2 } as const
    return order[a.room_type] - order[b.room_type]
  })

  const activeMembers = (room: RoomWithMembers) =>
    room.neighbors_room_members.filter((m) => m.left_at === null)

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Host Controls</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={createAdhoc}>
            <Plus className="h-4 w-4 mr-1" /> New Room
          </Button>
          <Button size="sm" variant="secondary" onClick={returnAll}>
            <Home className="h-4 w-4 mr-1" /> Return All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
