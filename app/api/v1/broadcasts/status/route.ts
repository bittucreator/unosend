import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - Get real-time broadcast status for polling
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
      status,
      total_recipients,
      sent_count,
      scheduled_at,
      sent_at,
      created_at,
      updated_at
    `)
    .eq('id', broadcastId)
    .eq('organization_id', membership.organization_id)
    .single()

  if (error || !broadcast) {
    return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 })
  }

  // If broadcast is sending, get detailed stats
  let stats = null
  if (broadcast.status === 'sending' || broadcast.status === 'sent') {
    // Get email stats for this broadcast
    const { data: emails } = await supabaseAdmin
      .from('emails')
      .select('status')
      .contains('metadata', { broadcast_id: broadcastId })

    if (emails) {
      stats = {
        total: emails.length,
        queued: emails.filter(e => e.status === 'queued').length,
        sent: emails.filter(e => e.status === 'sent').length,
        delivered: emails.filter(e => e.status === 'delivered').length,
        bounced: emails.filter(e => e.status === 'bounced').length,
        failed: emails.filter(e => e.status === 'failed').length,
      }
    }

    // Get open/click stats
    const { count: openCount } = await supabaseAdmin
      .from('email_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'opened')
      .in('email_id', (emails || []).map(e => e.status).length > 0 
        ? (await supabaseAdmin.from('emails').select('id').contains('metadata', { broadcast_id: broadcastId })).data?.map(e => e.id) || []
        : []
      )

    const { count: clickCount } = await supabaseAdmin
      .from('email_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'clicked')
      .in('email_id', (emails || []).map(e => e.status).length > 0 
        ? (await supabaseAdmin.from('emails').select('id').contains('metadata', { broadcast_id: broadcastId })).data?.map(e => e.id) || []
        : []
      )

    if (stats) {
      stats = {
        ...stats,
        opens: openCount || 0,
        clicks: clickCount || 0,
      }
    }
  }

  const response = {
    broadcast: {
      id: broadcast.id,
      name: broadcast.name,
      status: broadcast.status,
      total_recipients: broadcast.total_recipients,
      sent_count: broadcast.sent_count,
      progress: broadcast.total_recipients > 0 
        ? Math.round((broadcast.sent_count / broadcast.total_recipients) * 100)
        : 0,
      scheduled_at: broadcast.scheduled_at,
      sent_at: broadcast.sent_at,
      updated_at: broadcast.updated_at,
    },
    stats,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
