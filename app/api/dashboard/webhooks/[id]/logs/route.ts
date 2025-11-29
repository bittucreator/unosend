import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  // Verify the webhook belongs to this organization
  const { data: webhook } = await supabase
    .from('webhooks')
    .select('id')
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (!webhook) {
    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
  }

  // Get webhook logs
  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  const { data: logs, error, count } = await supabase
    .from('webhook_logs')
    .select('id, event_type, response_status, success, error, created_at, metadata', { count: 'exact' })
    .eq('webhook_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
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
