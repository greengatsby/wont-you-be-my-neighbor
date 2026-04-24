'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'

interface Recording {
  id: string
  room_id: string
  egress_id: string | null
  storage_url: string | null
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed'
  duration_seconds: number | null
  created_at: string
}

interface Room {
  id: string
  livekit_room_name: string
  room_type: 'main' | 'breakout' | 'adhoc'
  round_id: string | null
  created_at: string
}

interface Transcript {
  id: string
  recording_id: string
  speaker_user_id: string | null
  text: string
  start_time: number | null
  end_time: number | null
}

interface Member {
  room_id: string
  user_id: string
  role: string
  joined_at: string | null
  left_at: string | null
}

interface InterestTag {
  id: string
  user_id: string
  tag: string
  confidence: number | null
}

interface Connection {
  id: string
  user_a: string
  user_b: string
  shared_tags: string[] | null
  similarity_score: number | null
}

interface DetailsResponse {
  event: any
  rooms: Room[]
  recordings: Recording[]
  transcripts: Transcript[]
  members: Member[]
  tags: InterestTag[]
  connections: Connection[]
  users: Record<string, { display_name: string | null }>
}

function formatDuration(s: number | null) {
  if (!s) return '—'
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function StatusBadge({ status }: { status: Recording['transcription_status'] }) {
  if (status === 'completed')
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        completed
      </Badge>
    )
  if (status === 'failed')
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 gap-1">
        <XCircle className="h-3 w-3" />
        failed
      </Badge>
    )
  if (status === 'processing')
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        processing
      </Badge>
    )
  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="h-3 w-3" />
      pending
    </Badge>
  )
}

export function EventDetailViewer({ eventId }: { eventId: string }) {
  const [data, setData] = useState<DetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/details`)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to load event details')
        return
      }
      setData(json)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load event details')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleRetry() {
    setRetrying(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/retry-transcription`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Retry failed')
        return
      }
      toast.success(
        `Retry done — transcribed ${json.transcribed}/${json.total}, ${json.interestsExtracted} speakers tagged, ${json.connectionsCreated} connections`
      )
      await fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Retry failed')
    } finally {
      setRetrying(false)
    }
  }

  const userName = useCallback(
    (userId: string | null) => {
      if (!userId) return 'Unknown'
      return data?.users[userId]?.display_name || userId.slice(0, 8) + '…'
    },
    [data]
  )

  const recordingsByRoom = useMemo(() => {
    const map: Record<string, Recording[]> = {}
    data?.recordings.forEach((r) => {
      map[r.room_id] = map[r.room_id] || []
      map[r.room_id].push(r)
    })
    return map
  }, [data])

  const transcriptsByRecording = useMemo(() => {
    const map: Record<string, Transcript[]> = {}
    data?.transcripts.forEach((t) => {
      map[t.recording_id] = map[t.recording_id] || []
      map[t.recording_id].push(t)
    })
    return map
  }, [data])

  const membersByRoom = useMemo(() => {
    const map: Record<string, Member[]> = {}
    data?.members.forEach((m) => {
      map[m.room_id] = map[m.room_id] || []
      map[m.room_id].push(m)
    })
    return map
  }, [data])

  const tagsByUser = useMemo(() => {
    const map: Record<string, InterestTag[]> = {}
    data?.tags.forEach((t) => {
      map[t.user_id] = map[t.user_id] || []
      map[t.user_id].push(t)
    })
    return map
  }, [data])

  const breakoutRooms = (data?.rooms || []).filter((r) => r.room_type === 'breakout')
  const otherRooms = (data?.rooms || []).filter((r) => r.room_type !== 'breakout')

  const recordingCounts = useMemo(() => {
    const counts = { total: 0, completed: 0, failed: 0, pending: 0, processing: 0 }
    for (const r of data?.recordings || []) {
      counts.total++
      counts[r.transcription_status]++
    }
    return counts
  }, [data])

  const retriable = recordingCounts.failed + recordingCounts.processing

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) return null
  const { event } = data

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="text-sm text-muted-foreground flex gap-2 items-center mt-1">
            <Badge variant="outline">{event.status}</Badge>
            {event.ended_at && <span>ended {new Date(event.ended_at).toLocaleString()}</span>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={handleRetry}
          disabled={retrying || retriable === 0}
          title={retriable === 0 ? 'No failed/processing recordings to retry' : ''}
        >
          {retrying ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-1" />
          )}
          Retry transcription{retriable > 0 ? ` (${retriable})` : ''}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Rooms" value={data.rooms.length} />
        <StatCard label="Recordings" value={recordingCounts.total} />
        <StatCard label="Completed" value={recordingCounts.completed} tone="green" />
        <StatCard label="Failed" value={recordingCounts.failed} tone="red" />
        <StatCard label="Transcript segments" value={data.transcripts.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Breakout rooms & recordings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {breakoutRooms.length === 0 && (
            <p className="text-sm text-muted-foreground">No breakout rooms for this event.</p>
          )}
          {breakoutRooms.map((room) => {
            const recs = recordingsByRoom[room.id] || []
            const members = membersByRoom[room.id] || []
            return (
              <div key={room.id} className="border rounded p-3 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="font-mono text-sm">{room.livekit_room_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {members.length} member{members.length === 1 ? '' : 's'}:{' '}
                      {members.map((m) => userName(m.user_id)).join(', ') || '—'}
                    </div>
                  </div>
                  <Badge variant="outline">breakout</Badge>
                </div>

                {recs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recordings.</p>
                ) : (
                  recs.map((rec) => {
                    const segs = transcriptsByRecording[rec.id] || []
                    return (
                      <div key={rec.id} className="bg-muted/40 rounded p-2 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <StatusBadge status={rec.transcription_status} />
                          {rec.duration_seconds && (
                            <span className="text-muted-foreground">
                              {formatDuration(rec.duration_seconds)}
                            </span>
                          )}
                          {rec.storage_url && (
                            <a
                              href={rec.storage_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              open ogg <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {rec.egress_id && (
                            <span className="font-mono text-muted-foreground">
                              {rec.egress_id}
                            </span>
                          )}
                        </div>

                        {segs.length > 0 ? (
                          <div className="bg-background border rounded p-2 text-xs space-y-1 max-h-80 overflow-auto">
                            {segs.map((seg) => (
                              <div key={seg.id} className="flex gap-2">
                                <span className="text-muted-foreground shrink-0 w-10 font-mono">
                                  {seg.start_time !== null
                                    ? `${Math.floor(seg.start_time)}s`
                                    : ''}
                                </span>
                                <span className="font-semibold shrink-0 w-28 truncate">
                                  {userName(seg.speaker_user_id)}
                                </span>
                                <span>{seg.text}</span>
                              </div>
                            ))}
                          </div>
                        ) : rec.transcription_status === 'completed' ? (
                          <p className="text-xs text-muted-foreground italic">
                            No transcript segments.
                          </p>
                        ) : null}
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {otherRooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Main / adhoc rooms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {otherRooms.map((room) => {
              const recs = recordingsByRoom[room.id] || []
              return (
                <div key={room.id} className="flex items-center gap-2 flex-wrap text-xs border rounded p-2">
                  <Badge variant="outline">{room.room_type}</Badge>
                  <span className="font-mono">{room.livekit_room_name}</span>
                  <span className="text-muted-foreground">
                    {recs.length} recording{recs.length === 1 ? '' : 's'} (not transcribed — too many speakers)
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interest tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(tagsByUser).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tags extracted for this event yet.
            </p>
          ) : (
            Object.entries(tagsByUser).map(([userId, tags]) => (
              <div key={userId} className="flex items-start gap-2 flex-wrap">
                <div className="text-sm font-semibold w-32 shrink-0">{userName(userId)}</div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <Badge key={t.id} variant="secondary" className="text-xs">
                      {t.tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Connections ({data.connections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.connections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No connections created. Need at least one pair of speakers with overlapping
              interest tags.
            </p>
          ) : (
            <div className="space-y-2">
              {data.connections.map((c) => (
                <div key={c.id} className="text-sm flex items-center gap-2 flex-wrap border rounded p-2">
                  <span className="font-semibold">{userName(c.user_a)}</span>
                  <span className="text-muted-foreground">↔</span>
                  <span className="font-semibold">{userName(c.user_b)}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-xs text-muted-foreground">
                    similarity {c.similarity_score?.toFixed(2) ?? '—'}
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {(c.shared_tags || []).map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone?: 'green' | 'red' | 'blue'
}) {
  const color =
    tone === 'green'
      ? 'text-green-600'
      : tone === 'red'
        ? 'text-red-600'
        : tone === 'blue'
          ? 'text-blue-600'
          : ''
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}
