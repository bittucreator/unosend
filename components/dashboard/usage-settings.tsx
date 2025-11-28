'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Mail, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface UsageData {
  period_start: string
  period_end: string
  emails_sent: number
  emails_delivered: number
  emails_bounced: number
}

interface UsageSettingsProps {
  organizationId: string
}

export function UsageSettings({ organizationId }: UsageSettingsProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const MONTHLY_LIMIT = 100000 // Free tier limit

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        // For now, we'll use mock data since usage API isn't implemented
        // In production, this would call /api/v1/usage
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        
        setUsage({
          period_start: startOfMonth.toISOString(),
          period_end: endOfMonth.toISOString(),
          emails_sent: 0,
          emails_delivered: 0,
          emails_bounced: 0,
        })
      } catch {
        toast.error('Failed to load usage data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
  }, [organizationId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const usagePercent = usage ? Math.round((usage.emails_sent / MONTHLY_LIMIT) * 100) : 0
  const deliveryRate = usage && usage.emails_sent > 0 
    ? Math.round((usage.emails_delivered / usage.emails_sent) * 100) 
    : 100

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Current Period */}
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>
          Billing period: {usage ? formatDate(usage.period_start) : ''} - {usage ? formatDate(usage.period_end) : ''}
        </span>
      </div>

      {/* Usage Progress */}
      <div className="border border-stone-200/60 rounded-xl p-5 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Mail className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h3 className="font-medium text-[14px]">Email Usage</h3>
              <p className="text-[12px] text-muted-foreground">Monthly email sending limit</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[11px]">Free Tier</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Emails sent this month</span>
            <span className="font-medium">{usage?.emails_sent.toLocaleString()} / {MONTHLY_LIMIT.toLocaleString()}</span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-stone-900'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }} 
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {usagePercent}% of monthly limit used • Resets on the 1st of each month
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-stone-200/60 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-[12px] text-muted-foreground">Sent</span>
          </div>
          <p className="text-2xl font-bold">{usage?.emails_sent.toLocaleString() || 0}</p>
          <p className="text-[11px] text-muted-foreground mt-1">emails this month</p>
        </div>

        <div className="border border-stone-200/60 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-[12px] text-muted-foreground">Delivered</span>
          </div>
          <p className="text-2xl font-bold">{usage?.emails_delivered.toLocaleString() || 0}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{deliveryRate}% delivery rate</p>
        </div>

        <div className="border border-stone-200/60 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-[12px] text-muted-foreground">Bounced</span>
          </div>
          <p className="text-2xl font-bold">{usage?.emails_bounced.toLocaleString() || 0}</p>
          <p className="text-[11px] text-muted-foreground mt-1">failed deliveries</p>
        </div>
      </div>

      {/* Usage History placeholder */}
      <div className="border border-stone-200/60 rounded-xl p-5 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-stone-100 rounded-lg">
            <BarChart3 className="h-4 w-4 text-stone-600" />
          </div>
          <div>
            <h3 className="font-medium text-[14px]">Usage History</h3>
            <p className="text-[12px] text-muted-foreground">Email sending trends over time</p>
          </div>
        </div>
        
        <div className="h-32 flex items-center justify-center border border-dashed border-stone-200 rounded-lg bg-stone-50">
          <p className="text-[13px] text-muted-foreground">
            Usage chart coming soon
          </p>
        </div>
      </div>
    </div>
  )
}
