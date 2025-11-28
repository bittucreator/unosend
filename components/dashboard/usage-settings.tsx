'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UsageChart } from './usage-chart'
import { 
  Loader2, 
  Mail, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface UsageData {
  id: string
  period_start: string
  period_end: string
  emails_sent: number
  emails_delivered: number
  emails_bounced: number
}

interface PlanInfo {
  plan: string
  email_limit: number
  billing_status: string
  billing_cycle_start: string | null
  billing_cycle_end: string | null
}

interface DailyUsage {
  date: string
  value: number
}

interface UsageSettingsProps {
  organizationId: string
}

// Plan limits configuration
const PLAN_LIMITS: Record<string, { emails: number; name: string; color: string }> = {
  free: { emails: 5000, name: 'Free', color: 'bg-stone-100 text-stone-700' },
  pro: { emails: 50000, name: 'Pro', color: 'bg-blue-100 text-blue-700' },
  scale: { emails: 200000, name: 'Scale', color: 'bg-purple-100 text-purple-700' },
  enterprise: { emails: -1, name: 'Enterprise', color: 'bg-amber-100 text-amber-700' },
}

export function UsageSettings({ organizationId }: UsageSettingsProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchUsage = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    
    try {
      const supabase = createClient()
      
      // Get current period dates
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      // Fetch plan info from workspace/organization
      const { data: orgData } = await supabase
        .from('workspaces')
        .select('plan, email_limit, billing_status, billing_cycle_start, billing_cycle_end')
        .eq('id', organizationId)
        .single()

      if (orgData) {
        setPlanInfo(orgData as PlanInfo)
      } else {
        // Default to free plan if not found
        setPlanInfo({
          plan: 'free',
          email_limit: 5000,
          billing_status: 'active',
          billing_cycle_start: startOfMonth.toISOString(),
          billing_cycle_end: endOfMonth.toISOString(),
        })
      }

      // Fetch usage for current period
      const { data: usageData } = await supabase
        .from('usage')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('period_start', startOfMonth.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (usageData) {
        setUsage(usageData)
      } else {
        // Calculate usage from emails table if no usage record exists
        const { count: emailCount } = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', startOfMonth.toISOString())
        
        const { count: deliveredCount } = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'delivered')
          .gte('created_at', startOfMonth.toISOString())
        
        const { count: bouncedCount } = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'bounced')
          .gte('created_at', startOfMonth.toISOString())

        setUsage({
          id: 'calculated',
          period_start: startOfMonth.toISOString(),
          period_end: endOfMonth.toISOString(),
          emails_sent: emailCount || 0,
          emails_delivered: deliveredCount || 0,
          emails_bounced: bouncedCount || 0,
        })
      }

      // Fetch daily email counts for chart (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: emails } = await supabase
        .from('emails')
        .select('created_at')
        .eq('organization_id', organizationId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      // Group by day
      const dailyCounts: Record<string, number> = {}
      
      // Initialize all days with 0
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() - 29 + i)
        const dateStr = date.toISOString().split('T')[0]
        dailyCounts[dateStr] = 0
      }

      // Count emails per day
      emails?.forEach(email => {
        const dateStr = email.created_at.split('T')[0]
        if (Object.prototype.hasOwnProperty.call(dailyCounts, dateStr)) {
          dailyCounts[dateStr]++
        }
      })

      // Convert to array
      const chartData = Object.entries(dailyCounts).map(([date, value]) => ({
        date,
        value,
      }))

      setDailyUsage(chartData)
      setLastUpdated(new Date())

      if (showRefresh) {
        toast.success('Usage data refreshed')
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
      if (showRefresh) {
        toast.error('Failed to refresh usage data')
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchUsage()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUsage()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchUsage])

  // Real-time subscription for email updates
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('usage-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          // Refresh usage when new email is sent
          fetchUsage()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, fetchUsage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentPlan = planInfo?.plan || 'free'
  const planConfig = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free
  const emailLimit = planInfo?.email_limit || planConfig.emails
  const isUnlimited = emailLimit === -1
  
  const usagePercent = isUnlimited ? 0 : Math.round(((usage?.emails_sent || 0) / emailLimit) * 100)
  const deliveryRate = usage && usage.emails_sent > 0 
    ? Math.round((usage.emails_delivered / usage.emails_sent) * 100) 
    : 100
  const bounceRate = usage && usage.emails_sent > 0 
    ? Math.round((usage.emails_bounced / usage.emails_sent) * 100) 
    : 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverLimit = usagePercent >= 100
  const isNearLimit = usagePercent >= 80 && usagePercent < 100

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            Billing period: {usage ? formatDate(usage.period_start) : ''} - {usage ? formatDate(usage.period_end) : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fetchUsage(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Alert for over/near limit */}
      {isOverLimit && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div className="flex-1">
            <p className="font-medium text-red-900 text-[14px]">Email limit exceeded</p>
            <p className="text-[13px] text-red-700">Upgrade your plan to continue sending emails.</p>
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Zap className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        </div>
      )}

      {isNearLimit && !isOverLimit && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div className="flex-1">
            <p className="font-medium text-amber-900 text-[14px]">Approaching email limit</p>
            <p className="text-[13px] text-amber-700">You&apos;ve used {usagePercent}% of your monthly quota.</p>
          </div>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
            <Zap className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        </div>
      )}

      {/* Usage Progress */}
      <div className="border border-stone-200 rounded-xl p-5 bg-white space-y-4">
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
          <Badge className={planConfig.color}>{planConfig.name}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Emails sent this month</span>
            <span className="font-medium">
              {(usage?.emails_sent || 0).toLocaleString()} 
              {!isUnlimited && ` / ${emailLimit.toLocaleString()}`}
              {isUnlimited && ' (Unlimited)'}
            </span>
          </div>
          {!isUnlimited && (
            <>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent > 100 ? 'bg-red-500' : usagePercent > 80 ? 'bg-amber-500' : 'bg-stone-900'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }} 
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {usagePercent}% of monthly limit used • Resets on the 1st of each month
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-stone-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-[12px] text-muted-foreground">Sent</span>
          </div>
          <p className="text-2xl font-bold">{(usage?.emails_sent || 0).toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-1">emails this month</p>
        </div>

        <div className="border border-stone-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-[12px] text-muted-foreground">Delivered</span>
          </div>
          <p className="text-2xl font-bold">{(usage?.emails_delivered || 0).toLocaleString()}</p>
          <p className={`text-[11px] mt-1 ${deliveryRate >= 95 ? 'text-green-600' : deliveryRate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
            {deliveryRate}% delivery rate
          </p>
        </div>

        <div className="border border-stone-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-[12px] text-muted-foreground">Bounced</span>
          </div>
          <p className="text-2xl font-bold">{(usage?.emails_bounced || 0).toLocaleString()}</p>
          <p className={`text-[11px] mt-1 ${bounceRate <= 2 ? 'text-green-600' : bounceRate <= 5 ? 'text-amber-600' : 'text-red-600'}`}>
            {bounceRate}% bounce rate
          </p>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="border border-stone-200 rounded-xl p-5 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-stone-100 rounded-lg">
            <BarChart3 className="h-4 w-4 text-stone-600" />
          </div>
          <div>
            <h3 className="font-medium text-[14px]">Email Volume</h3>
            <p className="text-[12px] text-muted-foreground">Emails sent per day (last 30 days)</p>
          </div>
        </div>
        
        {dailyUsage.length > 0 && dailyUsage.some(d => d.value > 0) ? (
          <UsageChart data={dailyUsage} height={180} />
        ) : (
          <div className="h-44 flex items-center justify-center border border-dashed border-stone-200 rounded-lg bg-stone-50">
            <div className="text-center">
              <Mail className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">
                No email activity yet
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Send your first email to see usage data
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plan Details */}
      <div className="border border-stone-200 rounded-xl p-5 bg-white">
        <h3 className="font-medium text-[14px] mb-3">Plan Limits</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Emails per month</span>
            <span className="font-medium">
              {isUnlimited ? 'Unlimited' : emailLimit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium">
              {isUnlimited ? 'Unlimited' : Math.max(0, emailLimit - (usage?.emails_sent || 0)).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Billing Status</span>
            <Badge variant={planInfo?.billing_status === 'active' ? 'default' : 'destructive'} className="text-[11px]">
              {planInfo?.billing_status || 'Active'}
            </Badge>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Overage Rate</span>
            <span className="font-medium">
              {currentPlan === 'free' ? 'Not available' : '$0.80/1K emails'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
