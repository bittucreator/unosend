'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { Menu, Search, HelpCircle, BookOpen } from 'lucide-react'

interface TopNavProps {
  onMenuClick?: () => void
  organizationId: string
}

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
  free: 5000,
  pro: 50000,
  scale: 200000,
  enterprise: -1, // Unlimited
}

export function TopNav({ onMenuClick, organizationId }: TopNavProps) {
  const [emailsLeft, setEmailsLeft] = useState<number | null>(null)
  const [emailLimit, setEmailLimit] = useState<number>(5000)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const supabase = createClient()
        
        // Get current month period
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        
        // Fetch plan info
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('organization_id', organizationId)
          .single()
        
        const plan = subscription?.plan || 'free'
        const limit = PLAN_LIMITS[plan] || 5000
        setEmailLimit(limit)
        
        // First try to get from usage table
        const { data: usage } = await supabase
          .from('usage')
          .select('emails_sent')
          .eq('organization_id', organizationId)
          .gte('period_start', startOfMonth)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        let emailsSent = usage?.emails_sent || 0
        
        // If no usage record, calculate from emails table
        if (!usage) {
          const { count } = await supabase
            .from('emails')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .gte('created_at', startOfMonth)
          
          emailsSent = count || 0
        }
        
        if (limit === -1) {
          // Enterprise - show as unlimited
          setEmailsLeft(-1)
        } else {
          setEmailsLeft(Math.max(0, limit - emailsSent))
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error)
        setEmailsLeft(5000) // Default fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000)
    return () => clearInterval(interval)
  }, [organizationId])

  // Calculate usage percentage for dot color
  const getUsageStatus = () => {
    if (emailsLeft === null || isLoading) return 'loading'
    if (emailsLeft === -1) return 'green' // Unlimited = green
    const percentLeft = (emailsLeft / emailLimit) * 100
    if (percentLeft >= 50) return 'green'    // 50%+ remaining = green
    if (percentLeft >= 20) return 'orange'   // 20-50% remaining = orange
    return 'red'                              // <20% remaining = red
  }

  const usageStatus = getUsageStatus()

  const formatEmailsLeft = (count: number | null) => {
    if (count === null || isLoading) return '...'
    if (count === -1) return 'Unlimited'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M emails left`
    if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K emails left`
    return `${count.toLocaleString()} emails left`
  }

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
          <Link href="/settings?tab=usage">
            <Badge 
              variant="secondary" 
              className="hidden sm:flex items-center gap-1.5 text-[11px] bg-stone-100 text-stone-600 border-0 px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span 
                className={`w-2 h-2 rounded-full ${
                  usageStatus === 'green' 
                    ? 'bg-emerald-500' 
                    : usageStatus === 'orange' 
                    ? 'bg-amber-500' 
                    : usageStatus === 'red'
                    ? 'bg-red-500'
                    : 'bg-stone-300'
                }`}
              />
              {formatEmailsLeft(emailsLeft)}
            </Badge>
          </Link>

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
