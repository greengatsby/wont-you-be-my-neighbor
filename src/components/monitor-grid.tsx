'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { breakoutLogClient } from '@/lib/breakout-debug-log'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { MonitorTile } from './monitor-tile'

interface Breakout {
  id: string
  livekit_room_name: string
  topic: string | null
  members: { user_id: string; display_name: string | null }[]
}

interface MonitorGridProps {
  eventId: string
  activeRoundId: string | null
  onJumpIn: (roomId: string) => void
}

export function MonitorGrid({ eventId, activeRoundId, onJumpIn }: MonitorGridProps) {
  const supabase = useMemo(() => createClient(), [])
  const [breakouts, setBreakouts] = useState<Breakout[]>([])

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from('neighbors_rooms')
      .select(`
        id, livekit_room_name, topic, room_type,
        neighbors_room_members(
          user_id, left_at,
          neighbors_users:user_id(display_name)
        )
      `)
      .eq('event_id', eventId)
      .eq('room_type', 'breakout')

    const shaped: Breakout[] = (data || [])
      .map((r: any) => ({
        id: r.id,
        livekit_room_name: r.livekit_room_name,
        topic: r.topic,
        members: (r.neighbors_room_members || [])
          .filter((m: any) => m.left_at === null)
          .map((m: any) => ({
            user_id: m.user_id,
            display_name: m.neighbors_users?.display_name || null,
          })),
      }))
      .filter((b) => b.members.length > 0)

    setBreakouts(shaped)
    breakoutLogClient('monitor_grid', 'refetch', 'active breakouts', {
      eventId,
      count: shaped.length,
      roomIds: shaped.map((b) => b.id),
    })
  }, [supabase, eventId])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel(`monitor-${eventId}`)
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
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch, supabase, eventId])

  // When the active round changes (e.g. a fresh pair-everyone), realtime
  // can be flaky during the burst of inserts. Force a refetch on mount of
  // a new round plus a short re-poll after ~1.5s to catch any stragglers.
  useEffect(() => {
    if (!activeRoundId) return
    refetch()
    const retry = setTimeout(refetch, 1500)
    return () => clearTimeout(retry)
  }, [activeRoundId, refetch])

  if (breakouts.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center text-sm text-muted-foreground">
          Waiting for breakouts…
        </CardContent>
      </Card>
    )
  }

  const cols = breakouts.length === 1 ? 1 : breakouts.length <= 4 ? 2 : 3

  return (
    <div
      className="grid gap-3 h-full"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridAutoRows: 'minmax(0, 1fr)',
      }}
    >
      {breakouts.map((b) => (
        <MonitorTile
          key={b.id}
          roomId={b.id}
          roomName={b.livekit_room_name}
          topic={b.topic}
          memberNames={b.members.map((m) => m.display_name || 'Neighbor')}
          onJumpIn={() => onJumpIn(b.id)}
        />
      ))}
    </div>
  )
}
