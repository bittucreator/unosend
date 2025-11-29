import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ emails: [] })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const range = searchParams.get('range') || '7d'
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
  const offset = parseInt(searchParams.get('offset') || '0')

  // Calculate time range
  const now = new Date()
  let startDate: Date

  switch (range) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000)
      break
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '7d':
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  // Build query
  let query = supabase
    .from('emails')
    .select(`
      id,
      from_email,
      to_emails,
      subject,
      status,
      created_at,
      sent_at,
      scheduled_for,
      email_events (
        id,
        event_type,
        created_at,
        metadata
      )
    `, { count: 'exact' })
    .eq('organization_id', membership.organization_id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply status filter
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  // Apply search filter (search in subject and to_emails)
  if (search) {
    // Use ilike for case-insensitive search
    query = query.or(`subject.ilike.%${search}%,to_emails.cs.{${search}}`)
  }

  const { data: emails, error } = await query

  if (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }

  return NextResponse.json({ emails: emails || [] })
}
