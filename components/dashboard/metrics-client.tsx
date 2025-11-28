'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, UsageChart } from '@/components/dashboard/usage-chart'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  MousePointer,
  Eye,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  Calendar,
  Clock
} from 'lucide-react'

interface MetricsData {
  total: number
  sent: number
  delivered: number
  bounced: number
  failed: number
  opens: number
  clicks: number
}

interface DailyData {
  date: string
  value: number
  label?: string
}

interface MetricsClientProps {
  organizationId: string
}

export function MetricsClient({ organizationId }: MetricsClientProps) {
  const [metrics, setMetrics] = useState<MetricsData>({
    total: 0,
    sent: 0,
    delivered: 0,
    bounced: 0,
    failed: 0,
    opens: 0,
    clicks: 0,
  })
  const [dailyVolume, setDailyVolume] = useState<DailyData[]>([])
  const [hourlyVolume, setHourlyVolume] = useState<DailyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const fetchMetrics = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    
    try {
      const supabase = createClient()
      
      // Calculate date range
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      // Fetch all emails in the time range
      const { data: emails } = await supabase
        .from('emails')
        .select('id, status, created_at, sent_at, delivered_at')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      // Calculate metrics
      const stats = {
        total: emails?.length || 0,
        sent: emails?.filter(e => e.status === 'sent' || e.status === 'delivered').length || 0,
        delivered: emails?.filter(e => e.status === 'delivered').length || 0,
        bounced: emails?.filter(e => e.status === 'bounced').length || 0,
        failed: emails?.filter(e => e.status === 'failed').length || 0,
        opens: 0, // Would need email_events tracking
        clicks: 0, // Would need email_events tracking
      }

      // Fetch email events for opens/clicks
      if (emails && emails.length > 0) {
        const emailIds = emails.map(e => e.id)
        const { data: events } = await supabase
          .from('email_events')
          .select('event_type')
          .in('email_id', emailIds)
          .in('event_type', ['opened', 'clicked'])

        if (events) {
          stats.opens = events.filter(e => e.event_type === 'opened').length
          stats.clicks = events.filter(e => e.event_type === 'clicked').length
        }
      }

      setMetrics(stats)

      // Group by day for chart
      const dailyCounts: Record<string, number> = {}
      for (let i = 0; i < daysAgo; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (daysAgo - 1 - i))
        const dateStr = date.toISOString().split('T')[0]
        dailyCounts[dateStr] = 0
      }

      emails?.forEach(email => {
        const dateStr = email.created_at.split('T')[0]
        if (dateStr in dailyCounts) {
          dailyCounts[dateStr]++
        }
      })

      setDailyVolume(Object.entries(dailyCounts).map(([date, value]) => ({ date, value })))

      // Group by hour for last 24 hours
      const hourlyCounts: Record<number, number> = {}
      for (let i = 0; i < 24; i++) {
        hourlyCounts[i] = 0
      }

      const last24Hours = new Date()
      last24Hours.setHours(last24Hours.getHours() - 24)

      emails?.filter(e => new Date(e.created_at) >= last24Hours).forEach(email => {
        const hour = new Date(email.created_at).getHours()
        hourlyCounts[hour]++
      })

      setHourlyVolume(
        Object.entries(hourlyCounts).map(([hour, value]) => ({
          date: `${hour}:00`,
          value,
          label: `${hour}:00`,
        }))
      )

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [organizationId, timeRange])

  useEffect(() => {
    fetchMetrics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchMetrics(), 30000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('metrics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => fetchMetrics()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, fetchMetrics])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const deliveryRate = metrics.sent > 0 ? ((metrics.delivered / metrics.sent) * 100).toFixed(1) : '0'
  const bounceRate = metrics.sent > 0 ? ((metrics.bounced / metrics.sent) * 100).toFixed(1) : '0'
  const openRate = metrics.delivered > 0 ? ((metrics.opens / metrics.delivered) * 100).toFixed(1) : '0'
  const clickRate = metrics.delivered > 0 ? ((metrics.clicks / metrics.delivered) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Metrics</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Track your email performance and engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-1 bg-stone-100 p-1 rounded-lg">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                timeRange === range 
                  ? 'bg-white shadow-sm text-stone-900' 
                  : 'text-muted-foreground hover:text-stone-900'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-stone-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="deliverability" className="text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Deliverability</TabsTrigger>
          <TabsTrigger value="engagement" className="text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Engagement</TabsTrigger>
          <TabsTrigger value="timing" className="text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Timing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Mail className="w-3.5 h-3.5" />
                Total Sent
              </p>
              <p className="text-2xl font-semibold">{metrics.total.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Delivered
              </p>
              <p className="text-2xl font-semibold">{metrics.delivered.toLocaleString()}</p>
              <p className={`text-[11px] flex items-center gap-1 mt-1 ${Number(deliveryRate) >= 95 ? 'text-green-600' : 'text-amber-600'}`}>
                <TrendingUp className="w-3 h-3" />
                {deliveryRate}% delivery rate
              </p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5" />
                Opens
              </p>
              <p className="text-2xl font-semibold">{metrics.opens.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{openRate}% open rate</p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <MousePointer className="w-3.5 h-3.5" />
                Clicks
              </p>
              <p className="text-2xl font-semibold">{metrics.clicks.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{clickRate}% click rate</p>
            </div>
          </div>

          {/* Email Volume Chart */}
          <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100">
              <h2 className="font-semibold text-[15px]">Email Volume</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Emails sent over the {timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'last 90 days'}
              </p>
            </div>
            <div className="p-4 sm:p-5">
              {dailyVolume.length > 0 && dailyVolume.some(d => d.value > 0) ? (
                <LineChart data={dailyVolume} height={250} color="#18181b" />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground border border-stone-200/60 rounded-xl bg-stone-50">
                  <div className="text-center">
                    <Mail className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-[13px]">No email data yet</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Send your first email to see analytics</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deliverability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Send className="w-3.5 h-3.5" />
                Sent
              </p>
              <p className="text-2xl font-semibold">{metrics.sent.toLocaleString()}</p>
              <Badge variant="outline" className="mt-2 text-[10px]">
                {metrics.total > 0 ? ((metrics.sent / metrics.total) * 100).toFixed(0) : 0}% of total
              </Badge>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Delivered
              </p>
              <p className="text-2xl font-semibold">{metrics.delivered.toLocaleString()}</p>
              <p className={`text-[11px] mt-2 ${Number(deliveryRate) >= 95 ? 'text-green-600' : 'text-amber-600'}`}>
                {deliveryRate}% rate
              </p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <XCircle className="w-3.5 h-3.5" />
                Bounced
              </p>
              <p className="text-2xl font-semibold">{metrics.bounced.toLocaleString()}</p>
              <p className={`text-[11px] flex items-center gap-1 mt-2 ${Number(bounceRate) <= 2 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingDown className="w-3 h-3" />
                {bounceRate}% rate
              </p>
            </div>
          </div>

          {/* Delivery Breakdown */}
          <div className="border border-stone-200/60 rounded-xl bg-white p-5">
            <h3 className="font-semibold text-[15px] mb-4">Delivery Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Delivered', value: metrics.delivered, color: 'bg-green-500' },
                { label: 'Bounced', value: metrics.bounced, color: 'bg-red-500' },
                { label: 'Failed', value: metrics.failed, color: 'bg-stone-400' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${metrics.total > 0 ? (item.value / metrics.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5" />
                Unique Opens
              </p>
              <p className="text-2xl font-semibold">{metrics.opens.toLocaleString()}</p>
              <p className={`text-[11px] mt-1 ${Number(openRate) >= 20 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {openRate}% of delivered
              </p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <MousePointer className="w-3.5 h-3.5" />
                Unique Clicks
              </p>
              <p className="text-2xl font-semibold">{metrics.clicks.toLocaleString()}</p>
              <p className={`text-[11px] mt-1 ${Number(clickRate) >= 3 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {clickRate}% of delivered
              </p>
            </div>
          </div>

          <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100">
              <h2 className="font-semibold text-[15px]">Top Clicked Links</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">Most popular links in your emails</p>
            </div>
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
                <MousePointer className="w-6 h-6 text-stone-400" />
              </div>
              <p className="text-[13px] text-muted-foreground">
                {metrics.clicks > 0 ? 'Link tracking coming soon' : 'No click data yet'}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden mt-6">
            <div className="p-4 sm:p-5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-[15px]">Hourly Distribution</h2>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">Email volume by hour (last 24 hours)</p>
            </div>
            <div className="p-4 sm:p-5">
              {hourlyVolume.length > 0 && hourlyVolume.some(d => d.value > 0) ? (
                <UsageChart data={hourlyVolume} height={200} showLabels={true} />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground border border-stone-200/60 rounded-xl bg-stone-50">
                  <div className="text-center">
                    <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-[13px]">No hourly data yet</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Send emails to see timing patterns</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-stone-200/60 rounded-xl bg-white p-5">
              <h3 className="font-medium text-[14px] mb-3">Peak Sending Hour</h3>
              {hourlyVolume.some(d => d.value > 0) ? (
                <>
                  <p className="text-3xl font-bold">
                    {hourlyVolume.reduce((max, d) => d.value > max.value ? d : max, hourlyVolume[0])?.label || '--'}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">Most emails sent</p>
                </>
              ) : (
                <p className="text-muted-foreground text-[13px]">No data</p>
              )}
            </div>
            <div className="border border-stone-200/60 rounded-xl bg-white p-5">
              <h3 className="font-medium text-[14px] mb-3">Emails Today</h3>
              <p className="text-3xl font-bold">
                {hourlyVolume.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">Last 24 hours</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
