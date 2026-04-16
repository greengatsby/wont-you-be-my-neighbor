'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface ProfileEditorProps {
  profile: {
    id: string
    display_name: string | null
    neighborhood: string | null
    phone: string | null
  }
  interestTags: { id: string; tag: string; confidence: number }[]
}

export function ProfileEditor({ profile, interestTags }: ProfileEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState(profile.display_name || '')
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood || '')
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState(interestTags)

  async function handleSave() {
    setLoading(true)
    const { error } = await supabase
      .from('neighbors_users')
      .update({
        display_name: name,
        neighborhood,
      })
      .eq('id', profile.id)

    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated!')
      router.refresh()
    }
  }

  async function handleRemoveTag(tagId: string) {
    const { error } = await supabase
      .from('neighbors_interest_tags')
      .delete()
      .eq('id', tagId)

    if (error) {
      toast.error('Failed to remove tag')
    } else {
      setTags((t) => t.filter((tag) => tag.id !== tagId))
      toast.success('Interest removed')
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Neighborhood</Label>
            <Input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="e.g. Eastside, Downtown"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={profile.phone || ''} disabled className="bg-muted" />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Interests</CardTitle>
          <p className="text-sm text-muted-foreground">
            These were extracted from your conversations. Remove any that don&apos;t fit.
          </p>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No interests extracted yet. Join an event to get started!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {tag.tag}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
