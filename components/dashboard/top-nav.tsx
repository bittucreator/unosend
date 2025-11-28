'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Menu, Search, HelpCircle, BookOpen } from 'lucide-react'

interface TopNavProps {
  onMenuClick?: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <nav className="border-b bg-[#fafafa] sticky top-0 z-50 h-12">
      <div className="h-full px-2 sm:px-3 flex items-center justify-between">
        {/* Left side - Menu button */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Center - Search bar */}
        <div className="flex-1 flex items-center justify-center max-w-md mx-auto">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-white border border-stone-200/60 rounded-lg hover:border-stone-300 transition-colors w-full">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search for anything...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="ml-auto text-xs bg-stone-100 px-1.5 py-0.5 rounded hidden sm:inline">⌘K</kbd>
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Emails left badge */}
          <Badge variant="secondary" className="hidden sm:flex text-[11px] bg-stone-100 text-stone-600 border-0 px-2 py-0.5">
            1,000 emails left
          </Badge>

          {/* Docs link */}
          <Link href="/docs" target="_blank">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[13px] text-muted-foreground hover:text-foreground">
              <BookOpen className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Docs</span>
            </Button>
          </Link>

          {/* Help link */}
          <Link href="/contact">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[13px] text-muted-foreground hover:text-foreground">
              <HelpCircle className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Help</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
