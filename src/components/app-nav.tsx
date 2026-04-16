'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface AppNavProps {
  user: {
    id: string
    display_name: string | null
    is_admin: boolean | null
  }
}

export function AppNav({ user }: AppNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const initials = (user.display_name || 'N')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/', label: 'Events' },
    { href: '/connections', label: 'Connections' },
    { href: '/profile', label: 'Profile' },
  ]

  if (user.is_admin) {
    links.push({ href: '/admin', label: 'Admin' })
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            Neighbor
          </Link>
          <nav className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-foreground ${
                  pathname === link.href
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
