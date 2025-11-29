import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// GET - Get email metrics/analytics
export async function GET(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { searchParams } = new URL(request.url)
  const days = Math.min(parseInt(searchParams.get('days') || '30'), 90)
  const groupBy = searchParams.get('group_by') || 'day' // day, hour, status

  // Calculate date range
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Fetch all emails in the time range
  const { data: emails, error: emailsError } = await supabaseAdmin
    .from('emails')
    .select('id, status, created_at, sent_at, delivered_at')
    .eq('organization_id', context.organizationId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (emailsError) {
    return apiError('Failed to fetch metrics', 500)
  }

  // Calculate base metrics
  const stats = {
    total: emails?.length || 0,
    sent: emails?.filter(e => e.status === 'sent' || e.status === 'delivered').length || 0,
    delivered: emails?.filter(e => e.status === 'delivered').length || 0,
    bounced: emails?.filter(e => e.status === 'bounced').length || 0,
    failed: emails?.filter(e => e.status === 'failed').length || 0,
    queued: emails?.filter(e => e.status === 'queued').length || 0,
    scheduled: emails?.filter(e => e.status === 'scheduled').length || 0,
    opens: 0,
    unique_opens: 0,
    clicks: 0,
    unique_clicks: 0,
  }

  // Fetch email events for opens/clicks
  if (emails && emails.length > 0) {
    const emailIds = emails.map(e => e.id)
    const { data: events } = await supabaseAdmin
      .from('email_events')
      .select('email_id, event_type')
      .in('email_id', emailIds)
      .in('event_type', ['opened', 'clicked'])

    if (events) {
      stats.opens = events.filter(e => e.event_type === 'opened').length
      stats.clicks = events.filter(e => e.event_type === 'clicked').length
      
      // Unique opens/clicks
      const uniqueOpens = new Set(events.filter(e => e.event_type === 'opened').map(e => e.email_id))
      const uniqueClicks = new Set(events.filter(e => e.event_type === 'clicked').map(e => e.email_id))
      stats.unique_opens = uniqueOpens.size
      stats.unique_clicks = uniqueClicks.size
    }
  }

  // Calculate rates
  const rates = {
    delivery_rate: stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 1000) / 10 : 0,
    bounce_rate: stats.sent > 0 ? Math.round((stats.bounced / stats.sent) * 1000) / 10 : 0,
    open_rate: stats.delivered > 0 ? Math.round((stats.unique_opens / stats.delivered) * 1000) / 10 : 0,
    click_rate: stats.delivered > 0 ? Math.round((stats.unique_clicks / stats.delivered) * 1000) / 10 : 0,
  }

  // Group data based on groupBy parameter
  let timeSeries: Array<{ period: string; count: number }> = []

  if (groupBy === 'day') {
    const dailyCounts: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const dateStr = date.toISOString().split('T')[0]
      dailyCounts[dateStr] = 0
    }
    emails?.forEach(email => {
      const dateStr = email.created_at.split('T')[0]
      if (dateStr in dailyCounts) {
        dailyCounts[dateStr]++
      }
    })
    timeSeries = Object.entries(dailyCounts).map(([period, count]) => ({ period, count }))
  } else if (groupBy === 'hour') {
    const hourlyCounts: Record<string, number> = {}
    for (let i = 0; i < 24; i++) {
      hourlyCounts[`${i.toString().padStart(2, '0')}:00`] = 0
    }
    const last24Hours = new Date()
    last24Hours.setHours(last24Hours.getHours() - 24)
    emails?.filter(e => new Date(e.created_at) >= last24Hours).forEach(email => {
      const hour = new Date(email.created_at).getHours()
      const key = `${hour.toString().padStart(2, '0')}:00`
      hourlyCounts[key]++
    })
    timeSeries = Object.entries(hourlyCounts).map(([period, count]) => ({ period, count }))
  } else if (groupBy === 'status') {
    timeSeries = [
      { period: 'delivered', count: stats.delivered },
      { period: 'bounced', count: stats.bounced },
      { period: 'failed', count: stats.failed },
      { period: 'queued', count: stats.queued },
      { period: 'scheduled', count: stats.scheduled },
    ]
  }

  return apiSuccess({
    period: {
      start: startDate.toISOString(),
      end: new Date().toISOString(),
      days,
    },
    summary: stats,
    rates,
    time_series: timeSeries,
  })
}
