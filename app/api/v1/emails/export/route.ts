import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Export email logs to CSV
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get('status')
  const startDate = request.nextUrl.searchParams.get('start_date')
  const endDate = request.nextUrl.searchParams.get('end_date')
  const format = request.nextUrl.searchParams.get('format') || 'csv'

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  try {
    // Build query
    let query = supabase
      .from('emails')
      .select(`
        id,
        to_email,
        from_email,
        subject,
        status,
        created_at,
        sent_at,
        delivered_at,
        opened_at,
        clicked_at
      `)
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false })
      .limit(10000) // Limit export size

    if (status) {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: emails, error } = await query

    if (error) {
      console.error('Export error:', error)
      return NextResponse.json({ error: 'Failed to export emails' }, { status: 500 })
    }

    if (format === 'json') {
      return NextResponse.json({ data: emails })
    }

    // Generate CSV
    const headers = ['id', 'to', 'from', 'subject', 'status', 'created_at', 'sent_at', 'delivered_at', 'opened_at', 'clicked_at']
    const rows = emails?.map(e => [
      e.id,
      e.to_email,
      e.from_email,
      e.subject,
      e.status,
      e.created_at || '',
      e.sent_at || '',
      e.delivered_at || '',
      e.opened_at || '',
      e.clicked_at || '',
    ]) || []

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="emails-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
