import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// Get detailed broadcast analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  // Get broadcast
  const { data: broadcast, error: fetchError } = await supabaseAdmin
    .from('broadcasts')
    .select(`
      id,
      name,
      subject,
      status,
      total_recipients,
      sent_count,
      scheduled_at,
      sent_at,
      created_at
    `)
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (fetchError || !broadcast) {
    return apiError('Broadcast not found', 404)
  }

  // Get all emails for this broadcast
  const { data: emails } = await supabaseAdmin
    .from('emails')
    .select('id, status, sent_at, opened_at')
    .contains('metadata', { broadcast_id: id })

  if (!emails || emails.length === 0) {
    return apiSuccess({
      broadcast: {
        id: broadcast.id,
        name: broadcast.name,
        subject: broadcast.subject,
        status: broadcast.status,
        scheduled_at: broadcast.scheduled_at,
        sent_at: broadcast.sent_at,
        created_at: broadcast.created_at,
      },
      stats: {
        total_recipients: broadcast.total_recipients || 0,
        sent: broadcast.sent_count || 0,
        delivered: 0,
        bounced: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        open_rate: 0,
        click_rate: 0,
      },
      timeline: [],
    })
  }

  // Calculate email stats
  const emailIds = emails.map(e => e.id)
  const stats = {
    total_recipients: broadcast.total_recipients || emails.length,
    sent: emails.filter(e => e.status === 'sent' || e.status === 'delivered').length,
    delivered: emails.filter(e => e.status === 'delivered').length,
    bounced: emails.filter(e => e.status === 'bounced').length,
    failed: emails.filter(e => e.status === 'failed').length,
    opened: emails.filter(e => e.opened_at).length,
    clicked: 0,
    unsubscribed: 0,
    open_rate: 0,
    click_rate: 0,
  }

  // Get event counts
  const { data: events } = await supabaseAdmin
    .from('email_events')
    .select('event_type')
    .in('email_id', emailIds)

  if (events) {
    stats.clicked = events.filter(e => e.event_type === 'clicked').length
    stats.unsubscribed = events.filter(e => e.event_type === 'unsubscribed').length
  }

  // Calculate rates
  if (stats.sent > 0) {
    stats.open_rate = Math.round((stats.opened / stats.sent) * 100 * 10) / 10
    stats.click_rate = Math.round((stats.clicked / stats.sent) * 100 * 10) / 10
  }

  // Build timeline (hourly breakdown)
  const timeline: Array<{ hour: string; sent: number; opened: number; clicked: number }> = []
  
  if (broadcast.sent_at) {
    const sentAt = new Date(broadcast.sent_at)
    
    // Get hourly events for last 48 hours
    const { data: timelineEvents } = await supabaseAdmin
      .from('email_events')
      .select('event_type, created_at')
      .in('email_id', emailIds)
      .gte('created_at', new Date(sentAt.getTime() - 48 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (timelineEvents) {
      // Group by hour
      const hourlyData: Record<string, { sent: number; opened: number; clicked: number }> = {}
      
      timelineEvents.forEach(event => {
        const hour = new Date(event.created_at).toISOString().slice(0, 13) + ':00:00.000Z'
        if (!hourlyData[hour]) {
          hourlyData[hour] = { sent: 0, opened: 0, clicked: 0 }
        }
        if (event.event_type === 'sent') hourlyData[hour].sent++
        if (event.event_type === 'opened') hourlyData[hour].opened++
        if (event.event_type === 'clicked') hourlyData[hour].clicked++
      })

      Object.entries(hourlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([hour, data]) => {
          timeline.push({ hour, ...data })
        })
    }
  }

  return apiSuccess({
    broadcast: {
      id: broadcast.id,
      name: broadcast.name,
      subject: broadcast.subject,
      status: broadcast.status,
      scheduled_at: broadcast.scheduled_at,
      sent_at: broadcast.sent_at,
      created_at: broadcast.created_at,
    },
    stats,
    timeline,
  })
}
