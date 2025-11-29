import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  }

  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const method = searchParams.get('method') || ''
  const range = searchParams.get('range') || '7d'
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
  const offset = parseInt(searchParams.get('offset') || '0')

  // Calculate date range
  const now = new Date()
  let startDate: Date

  switch (range) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000)
      break
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  let query = supabase
    .from('api_logs')
    .select(`
      id,
      method,
      endpoint,
      path,
      status_code,
      user_agent,
      duration_ms,
      created_at
    `, { count: 'exact' })
    .eq('organization_id', membership.organization_id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (search) {
    query = query.ilike('endpoint', `%${search}%`)
  }

  if (status) {
    // Filter by status code range
    if (status === '2xx') {
      query = query.gte('status_code', 200).lt('status_code', 300)
    } else if (status === '4xx') {
      query = query.gte('status_code', 400).lt('status_code', 500)
    } else if (status === '5xx') {
      query = query.gte('status_code', 500).lt('status_code', 600)
    }
  }

  if (method) {
    query = query.eq('method', method.toUpperCase())
  }

  const { data: logs, error, count } = await query

  if (error) {
    console.error('Error fetching API logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }

  return NextResponse.json({
    logs: logs || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (offset + limit) < (count || 0),
    },
  })
}
