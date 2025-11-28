import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - Get real-time email status updates
// Supports polling with ?since=timestamp to get only new updates
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since') // ISO timestamp
  const emailIds = searchParams.get('ids')?.split(',').filter(Boolean) // Specific email IDs
  const broadcastId = searchParams.get('broadcast_id')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // Build query
  let query = supabaseAdmin
    .from('emails')
    .select(`
      id,
      status,
      sent_at,
      delivered_at,
      opened_at,
      updated_at,
      metadata
    `)
    .eq('organization_id', membership.organization_id)
    .order('updated_at', { ascending: false })
    .limit(limit)

  // Filter by specific email IDs
  if (emailIds && emailIds.length > 0) {
    query = query.in('id', emailIds)
  }

  // Filter by broadcast
  if (broadcastId) {
    query = query.contains('metadata', { broadcast_id: broadcastId })
  }

  // Filter by updated since timestamp
  if (since) {
    query = query.gt('updated_at', since)
  }

  const { data: emails, error } = await query

  if (error) {
    console.error('Failed to fetch email status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }

  // Get latest events for these emails
  const emailIdsToFetch = emails?.map(e => e.id) || []
  let events: Array<{ email_id: string; event_type: string; created_at: string }> = []

  if (emailIdsToFetch.length > 0) {
    const { data: eventData } = await supabaseAdmin
      .from('email_events')
      .select('email_id, event_type, created_at')
      .in('email_id', emailIdsToFetch)
      .order('created_at', { ascending: false })

    events = eventData || []
  }

  // Group events by email
  const eventsByEmail: Record<string, Array<{ event_type: string; created_at: string }>> = {}
  events.forEach(event => {
    if (!eventsByEmail[event.email_id]) {
      eventsByEmail[event.email_id] = []
    }
    eventsByEmail[event.email_id].push({
      event_type: event.event_type,
      created_at: event.created_at,
    })
  })

  const response = {
    emails: emails?.map(email => ({
      id: email.id,
      status: email.status,
      sent_at: email.sent_at,
      delivered_at: email.delivered_at,
      opened_at: email.opened_at,
      updated_at: email.updated_at,
      events: eventsByEmail[email.id] || [],
    })) || [],
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
