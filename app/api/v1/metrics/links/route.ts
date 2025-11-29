import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// GET - Get top clicked links
export async function GET(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { searchParams } = new URL(request.url)
  const days = Math.min(parseInt(searchParams.get('days') || '30'), 90)
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

  // Calculate date range
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get emails for this organization in the time range
  const { data: emails } = await supabaseAdmin
    .from('emails')
    .select('id')
    .eq('organization_id', context.organizationId)
    .gte('created_at', startDate.toISOString())

  if (!emails || emails.length === 0) {
    return apiSuccess({
      period: { days, start: startDate.toISOString(), end: new Date().toISOString() },
      links: [],
      total_clicks: 0,
    })
  }

  const emailIds = emails.map(e => e.id)

  // Get click events with URLs from metadata
  const { data: clickEvents, error } = await supabaseAdmin
    .from('email_events')
    .select('metadata')
    .in('email_id', emailIds)
    .eq('event_type', 'clicked')
    .gte('created_at', startDate.toISOString())

  if (error) {
    return apiError('Failed to fetch click data', 500)
  }

  // Count clicks per URL
  const urlCounts: Record<string, number> = {}
  let totalClicks = 0

  clickEvents?.forEach(event => {
    const url = (event.metadata as { url?: string })?.url
    if (url) {
      urlCounts[url] = (urlCounts[url] || 0) + 1
      totalClicks++
    }
  })

  // Sort and limit
  const sortedLinks = Object.entries(urlCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([url, clicks]) => ({
      url,
      clicks,
      percentage: totalClicks > 0 ? Math.round((clicks / totalClicks) * 1000) / 10 : 0,
    }))

  return apiSuccess({
    period: {
      days,
      start: startDate.toISOString(),
      end: new Date().toISOString(),
    },
    links: sortedLinks,
    total_clicks: totalClicks,
  })
}
