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

  // Fetch the API log with all details
  const { data: log, error } = await supabase
    .from('api_logs')
    .select(`
      id,
      method,
      endpoint,
      path,
      status_code,
      user_agent,
      ip_address,
      request_body,
      response_body,
      duration_ms,
      created_at,
      api_key_id,
      api_keys (
        name,
        key_prefix
      )
    `)
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (error || !log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }

  return NextResponse.json({ log })
}
