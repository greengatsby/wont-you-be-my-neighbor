'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'

interface Round {
  round_type: 'random' | 'matched' | 'topic'
  duration_seconds: number
  prompt: string
  topic: string
}

interface AdminDashboardProps {
  events: any[]
}

export function AdminDashboard({ events: initialEvents }: AdminDashboardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [rounds, setRounds] = useState<Round[]>([
    { round_type: 'random', duration_seconds: 300, prompt: '', topic: '' },
  ])
  const [loading, setLoading] = useState(false)

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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

    // Create rounds
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage events and programs</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="April Neighborhood Mixer" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Come meet your neighbors!" />
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
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
                              updateRound(idx, 'duration_seconds', Number(e.target.value) * 60)
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

      <div className="space-y-4">
        {initialEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{event.title}</CardTitle>
                <Badge variant={
                  event.status === 'live' ? 'destructive' :
                  event.status === 'ended' ? 'secondary' : 'default'
                }>
                  {event.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {event.scheduled_at && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.scheduled_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
              <p className="text-sm">
                {event.neighbors_rounds?.length || 0} rounds programmed
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/events/${event.id}/lobby`)}
                >
                  {event.status === 'live' ? 'Go to Event' : 'Preview'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
