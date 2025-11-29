import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// GET - Get email events
export async function GET(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { searchParams } = new URL(request.url)
  const email_id = searchParams.get('email_id')
  const event_type = searchParams.get('event_type')
  const days = Math.min(parseInt(searchParams.get('days') || '7'), 90)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  // Calculate time range
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // First get emails for this org to filter events
  const { data: emails } = await supabaseAdmin
    .from('emails')
    .select('id')
    .eq('organization_id', context.organizationId)
    .gte('created_at', startDate.toISOString())

  if (!emails || emails.length === 0) {
    return apiSuccess({
      data: [],
      pagination: { total: 0, limit, offset, has_more: false },
    })
  }

  const emailIds = emails.map(e => e.id)

  // Build events query
  let query = supabaseAdmin
    .from('email_events')
    .select(`
      id,
      email_id,
      event_type,
      metadata,
      created_at,
      emails!inner (
        to_emails,
        subject
      )
    `, { count: 'exact' })
    .in('email_id', emailIds)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (email_id) {
    query = query.eq('email_id', email_id)
  }

  if (event_type) {
    query = query.eq('event_type', event_type)
  }

  const { data: events, error, count } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return apiError('Failed to fetch events', 500)
  }

  // Format response
  const formattedEvents = (events || []).map(event => {
    const emailData = event.emails as { to_emails?: string[]; subject?: string } | null
    return {
      id: event.id,
      email_id: event.email_id,
      type: event.event_type,
      metadata: event.metadata,
      created_at: event.created_at,
      email: emailData ? {
        to: emailData.to_emails,
        subject: emailData.subject,
      } : null,
    }
  })

  return apiSuccess({
    data: formattedEvents,
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (offset + limit) < (count || 0),
    },
    filters: {
      email_id: email_id || null,
      event_type: event_type || null,
      days,
    },
  })
}
