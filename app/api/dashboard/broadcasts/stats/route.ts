import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - Get broadcast analytics for dashboard
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const broadcastId = searchParams.get('id')

  if (!broadcastId) {
    return NextResponse.json({ error: 'Broadcast ID required' }, { status: 400 })
  }

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // Get broadcast
  const { data: broadcast, error } = await supabaseAdmin
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
    .eq('id', broadcastId)
    .eq('organization_id', membership.organization_id)
    .single()

  if (error || !broadcast) {
    return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 })
  }

  // Get all emails for this broadcast
  const { data: emails } = await supabaseAdmin
    .from('emails')
    .select('id, status, sent_at, opened_at')
    .contains('metadata', { broadcast_id: broadcastId })

  const stats = {
    total: broadcast.total_recipients || 0,
    sent: 0,
    delivered: 0,
    bounced: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
    open_rate: 0,
    click_rate: 0,
  }

  if (emails && emails.length > 0) {
    const emailIds = emails.map(e => e.id)
    
    stats.sent = emails.filter(e => e.status === 'sent' || e.status === 'delivered').length
    stats.delivered = emails.filter(e => e.status === 'delivered').length
    stats.bounced = emails.filter(e => e.status === 'bounced').length
    stats.failed = emails.filter(e => e.status === 'failed').length
    stats.opened = emails.filter(e => e.opened_at).length

    // Get click count
    const { count: clickCount } = await supabaseAdmin
      .from('email_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'clicked')
      .in('email_id', emailIds)

    stats.clicked = clickCount || 0

    // Calculate rates
    if (stats.sent > 0) {
      stats.open_rate = Math.round((stats.opened / stats.sent) * 100 * 10) / 10
      stats.click_rate = Math.round((stats.clicked / stats.sent) * 100 * 10) / 10
    }
  }

  return NextResponse.json({
    broadcast: {
      id: broadcast.id,
      name: broadcast.name,
      subject: broadcast.subject,
      status: broadcast.status,
      scheduled_at: broadcast.scheduled_at,
      sent_at: broadcast.sent_at,
    },
    stats,
  })
}
