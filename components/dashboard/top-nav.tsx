'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Settings, LogOut, ChevronDown, HelpCircle, Book } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface TopNavProps {
  user: User
  organization: {
    id: string
    name: string
    slug: string
  }
}

export function TopNav({ user, organization }: TopNavProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = user.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <nav className="border-b bg-background sticky top-0 z-50 h-14">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/emails" className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">U</span>
          </div>
          <span className="text-lg font-semibold">Unosend</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Docs */}
          <Button variant="ghost" size="sm" asChild>
            <a href="https://docs.unosend.co" target="_blank" rel="noopener noreferrer">
              <Book className="w-4 h-4 mr-2" />
              Docs
            </a>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* Organization Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="text-sm font-medium">{organization.name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex flex-col items-start">
                <span className="font-medium">{organization.name}</span>
                <span className="text-xs text-muted-foreground">{organization.slug}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Organization Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Free plan</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
