import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get API usage statistics
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
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const period = request.nextUrl.searchParams.get('period') || '30d'

  try {
    // Calculate date range
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get organization limits
    const { data: org } = await supabase
      .from('organizations')
      .select('email_limit, contacts_limit, plan')
      .eq('id', membership.organization_id)
      .single()

    // Get current usage
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .gte('period_start', startDate.toISOString())
      .order('period_start', { ascending: false })
      .limit(1)
      .single()

    // Get API key usage (requests per day)
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id, name, last_used_at, created_at')
      .eq('organization_id', membership.organization_id)
      .is('revoked_at', null)

    // Get emails sent per day for rate limit tracking
    const { data: dailyEmails } = await supabase
      .from('emails')
      .select('created_at')
      .eq('organization_id', membership.organization_id)
      .gte('created_at', startDate.toISOString())

    // Group by day
    const dailyUsage: Record<string, number> = {}
    dailyEmails?.forEach(email => {
      const date = email.created_at.split('T')[0]
      dailyUsage[date] = (dailyUsage[date] || 0) + 1
    })

    // Calculate peak and average
    const dailyValues = Object.values(dailyUsage)
    const peak = Math.max(...dailyValues, 0)
    const average = dailyValues.length > 0 
      ? Math.round(dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length)
      : 0

    // Get today's usage
    const today = new Date().toISOString().split('T')[0]
    const todayUsage = dailyUsage[today] || 0

    // Calculate rate limits (based on plan)
    const rateLimits = {
      free: { daily: 100, perSecond: 2 },
      starter: { daily: 1000, perSecond: 10 },
      growth: { daily: 10000, perSecond: 50 },
      scale: { daily: 100000, perSecond: 200 },
      enterprise: { daily: 1000000, perSecond: 1000 },
    }

    const planLimits = rateLimits[org?.plan as keyof typeof rateLimits] || rateLimits.free

    return NextResponse.json({
      data: {
        plan: org?.plan || 'free',
        limits: {
          emailsPerMonth: org?.email_limit || 100000,
          contactsLimit: org?.contacts_limit || 1000,
          dailyLimit: planLimits.daily,
          perSecondLimit: planLimits.perSecond,
        },
        usage: {
          emailsSent: usage?.emails_sent || 0,
          emailsDelivered: usage?.emails_delivered || 0,
          emailsBounced: usage?.emails_bounced || 0,
          contactsCount: usage?.contacts_count || 0,
        },
        dailyStats: {
          today: todayUsage,
          peak,
          average,
          dailyUsage: Object.entries(dailyUsage).map(([date, count]) => ({ date, count })),
        },
        apiKeys: apiKeys?.map(k => ({
          id: k.id,
          name: k.name,
          lastUsed: k.last_used_at,
          created: k.created_at,
        })) || [],
      },
    })

  } catch (error) {
    console.error('API usage error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}
