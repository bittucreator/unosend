import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Export contacts to CSV
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const audienceId = request.nextUrl.searchParams.get('audience_id')
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
      .from('contacts')
      .select(`
        email,
        first_name,
        last_name,
        subscribed,
        created_at,
        metadata,
        audiences:audience_id (name)
      `)
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false })

    if (audienceId) {
      query = query.eq('audience_id', audienceId)
    }

    const { data: contacts, error } = await query

    if (error) {
      console.error('Export error:', error)
      return NextResponse.json({ error: 'Failed to export contacts' }, { status: 500 })
    }

    if (format === 'json') {
      return NextResponse.json({ data: contacts })
    }

    // Generate CSV
    const headers = ['email', 'first_name', 'last_name', 'subscribed', 'audience', 'created_at']
    const rows = contacts?.map(c => {
      // audiences could be an array or single object depending on relationship
      const audienceData = c.audiences
      let audienceName = ''
      if (Array.isArray(audienceData) && audienceData.length > 0) {
        audienceName = (audienceData[0] as { name?: string })?.name || ''
      } else if (audienceData && typeof audienceData === 'object' && 'name' in audienceData) {
        audienceName = (audienceData as { name: string }).name
      }
      return [
        c.email,
        c.first_name || '',
        c.last_name || '',
        c.subscribed ? 'Yes' : 'No',
        audienceName,
        new Date(c.created_at).toISOString(),
      ]
    }) || []

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
