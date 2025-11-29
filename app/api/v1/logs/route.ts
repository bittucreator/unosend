import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// GET - Get email logs/activity
export async function GET(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const email_id = searchParams.get('email_id')
  const days = Math.min(parseInt(searchParams.get('days') || '7'), 90)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')
  const search = searchParams.get('search')

  // Calculate time range
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Build query
  let query = supabaseAdmin
    .from('emails')
    .select(`
      id,
      from_email,
      to_emails,
      subject,
      status,
      created_at,
      sent_at,
      delivered_at,
      scheduled_for,
      metadata,
      email_events (
        id,
        event_type,
        created_at,
        metadata
      )
    `, { count: 'exact' })
    .eq('organization_id', context.organizationId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (status) {
    query = query.eq('status', status)
  }

  if (email_id) {
    query = query.eq('id', email_id)
  }

  if (search) {
    query = query.or(`subject.ilike.%${search}%,to_emails.cs.{${search}}`)
  }

  const { data: emails, error, count } = await query

  if (error) {
    console.error('Error fetching logs:', error)
    return apiError('Failed to fetch logs', 500)
  }

  // Format response
  const logs = (emails || []).map(email => ({
    id: email.id,
    from: email.from_email,
    to: email.to_emails,
    subject: email.subject,
    status: email.status,
    created_at: email.created_at,
    sent_at: email.sent_at,
    delivered_at: email.delivered_at,
    scheduled_for: email.scheduled_for,
    metadata: email.metadata,
    events: (email.email_events || []).map(e => ({
      type: e.event_type,
      created_at: e.created_at,
      metadata: e.metadata,
    })),
  }))

  return apiSuccess({
    data: logs,
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (offset + limit) < (count || 0),
    },
    filters: {
      status: status || null,
      days,
      search: search || null,
    },
  })
}
