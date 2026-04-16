'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Phone } from 'lucide-react'

interface ConnectionCardProps {
  connectionId: string
  neighbor: { id: string; display_name: string | null; phone: string | null }
  sharedTags: string[]
  similarityScore: number | null
  hasSharedContact: boolean
  neighborSharedContact: boolean
  isUserA: boolean
}

export function ConnectionCard({
  connectionId,
  neighbor,
  sharedTags,
  similarityScore,
  hasSharedContact,
  neighborSharedContact,
  isUserA,
}: ConnectionCardProps) {
  const [shared, setShared] = useState(hasSharedContact)
  const supabase = createClient()

  const initials = (neighbor.display_name || 'N')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleShareContact() {
    const field = isUserA ? 'contact_shared_a' : 'contact_shared_b'
    const { error } = await supabase
      .from('neighbors_connections')
      .update({ [field]: true })
      .eq('id', connectionId)

    if (error) {
      toast.error('Failed to share contact')
      return
    }

    setShared(true)
    toast.success('Contact shared!')
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{neighbor.display_name || 'Neighbor'}</h3>
              {similarityScore && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(similarityScore * 100)}% match
                </span>
              )}
            </div>

            {sharedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {sharedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              {shared && neighborSharedContact && neighbor.phone ? (
                <span className="text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {neighbor.phone}
                </span>
              ) : shared ? (
                <span className="text-xs text-muted-foreground">
                  Waiting for {neighbor.display_name} to share their contact
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={handleShareContact}>
                  Share my contact
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
