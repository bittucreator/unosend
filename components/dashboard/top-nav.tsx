'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { Menu, Search, HelpCircle, BookOpen } from 'lucide-react'

interface TopNavProps {
  onMenuClick?: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const openCommandPalette = () => {
    // Dispatch keyboard event to trigger command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <nav className="border-b border-stone-200 bg-white sticky top-0 z-50 h-12">
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

        {/* Center - Search bar / Command Palette trigger */}
        <div className="flex-1 flex items-center justify-center max-w-md mx-auto">
          <button 
            onClick={openCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-500 bg-stone-50 border border-stone-200 rounded-lg hover:border-stone-300 hover:bg-stone-100 transition-colors w-full"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline text-stone-400">Search for anything...</span>
            <span className="sm:hidden text-stone-400">Search...</span>
            <div className="ml-auto hidden sm:flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </div>
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1">
          {/* Emails left badge */}
          <Badge variant="secondary" className="hidden sm:flex text-[11px] bg-stone-100 text-stone-600 border-0 px-2 py-0.5">
            1,000 emails left
          </Badge>

          {/* Docs link */}
          <Link href="/docs" target="_blank">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[13px] text-stone-500 hover:text-stone-900">
              <BookOpen className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Docs</span>
            </Button>
          </Link>

          {/* Help link */}
          <Link href="/contact">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[13px] text-stone-500 hover:text-stone-900">
              <HelpCircle className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Help</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
