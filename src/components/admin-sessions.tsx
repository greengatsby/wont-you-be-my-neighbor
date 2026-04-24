'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Plus, Trash2, ArrowLeft, Search } from 'lucide-react'

export interface SessionRow {
  id: string
  title: string
  status: string
  scheduled_at: string | null
  ended_at: string | null
  created_at: string
  rounds_count: number
  recordings: {
    total: number
    completed: number
    failed: number
    pending: number
    processing: number
  }
  tags_count: number
}

interface Round {
  round_type: 'random' | 'matched' | 'topic'
  duration_seconds: number
  prompt: string
  topic: string
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'live'
      ? 'destructive'
      : status === 'ended'
        ? 'secondary'
        : 'default'
  return <Badge variant={variant}>{status}</Badge>
}

export function AdminSessions({ rows }: { rows: SessionRow[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [rounds, setRounds] = useState<Round[]>([
    { round_type: 'random', duration_seconds: 300, prompt: '', topic: '' },
  ])
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (q && !r.title.toLowerCase().includes(q)) return false
      return true
    })
  }, [rows, search, statusFilter])

  function addRound() {
    setRounds((r) => [
      ...r,
      { round_type: 'random', duration_seconds: 300, prompt: '', topic: '' },
    ])
  }

  function removeRound(idx: number) {
    setRounds((r) => r.filter((_, i) => i !== idx))
  }

  function updateRound(idx: number, field: keyof Round, value: string | number) {
    setRounds((r) =>
      r.map((round, i) => (i === idx ? { ...round, [field]: value } : round))
    )
  }

  async function handleCreate() {
    if (!title || !scheduledAt) {
      toast.error('Title and date are required')
      return
    }
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const roomName = `neighbor-event-${Date.now()}`

    const { data: event, error } = await supabase
      .from('neighbors_events')
      .insert({
        title,
        description,
        host_id: user.id,
        scheduled_at: new Date(scheduledAt).toISOString(),
        status: 'scheduled',
        livekit_room_name: roomName,
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const roundInserts = rounds.map((r, i) => ({
      event_id: event.id,
      round_number: i + 1,
      round_type: r.round_type,
      duration_seconds: r.duration_seconds,
      prompt: r.prompt || null,
      topic: r.round_type === 'topic' ? r.topic || null : null,
    }))

    const { error: roundError } = await supabase
      .from('neighbors_rounds')
      .insert(roundInserts)

    if (roundError) {
      toast.error(roundError.message)
    } else {
      toast.success('Event created!')
      setOpen(false)
      setTitle('')
      setDescription('')
      setScheduledAt('')
      setRounds([{ round_type: 'random', duration_seconds: 300, prompt: '', topic: '' }])
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Open a session to view transcripts, interest tags, and connections.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="April Neighborhood Mixer"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Come meet your neighbors!"
                />
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Program (Run of Show)</Label>
                  <Button variant="outline" size="sm" onClick={addRound}>
                    <Plus className="mr-1 h-3 w-3" /> Add Round
                  </Button>
                </div>

                {rounds.map((round, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Round {idx + 1}</span>
                        {rounds.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeRound(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={round.round_type}
                            onValueChange={(v) => updateRound(idx, 'round_type', v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="random">Random Pairs</SelectItem>
                              <SelectItem value="matched">Matched (by interests)</SelectItem>
                              <SelectItem value="topic">Topic Rooms</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Duration (minutes)</Label>
                          <Input
                            type="number"
                            min={1}
                            value={round.duration_seconds / 60}
                            onChange={(e) =>
                              updateRound(
                                idx,
                                'duration_seconds',
                                Number(e.target.value) * 60
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Prompt / Question</Label>
                        <Input
                          value={round.prompt}
                          onChange={(e) => updateRound(idx, 'prompt', e.target.value)}
                          placeholder="What's your favorite thing about this neighborhood?"
                        />
                      </div>
                      {round.round_type === 'topic' && (
                        <div className="space-y-1">
                          <Label className="text-xs">Topic</Label>
                          <Input
                            value={round.topic}
                            onChange={(e) => updateRound(idx, 'topic', e.target.value)}
                            placeholder="Music, Gardening, etc."
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full" onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {rows.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No sessions match the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Rounds</TableHead>
                  <TableHead>Recordings</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/events/${row.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{row.title}</div>
                      {row.ended_at && (
                        <div className="text-xs text-muted-foreground">
                          ended {format(new Date(row.ended_at), 'MMM d, h:mm a')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.scheduled_at
                        ? format(new Date(row.scheduled_at), 'MMM d, yyyy h:mm a')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm">{row.rounds_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-green-600 font-semibold">
                          {row.recordings.completed}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-red-600 font-semibold">
                          {row.recordings.failed}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">{row.recordings.total}</span>
                        <span className="text-muted-foreground ml-1">
                          (done / failed / total)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{row.tags_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
