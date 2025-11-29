import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get billing/subscription details
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Check user has access to this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get subscription info
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    // Get usage for current period
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('period_start', startOfMonth.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // If no usage record, calculate from emails
    let emailsSent = usage?.emails_sent || 0
    if (!usage) {
      const { count } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', startOfMonth.toISOString())
      emailsSent = count || 0
    }

    // Get payment history/invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Plan limits
    const planLimits: Record<string, number> = {
      free: 5000,
      pro: 50000,
      scale: 200000,
      enterprise: -1,
    }

    // Build subscription object
    const plan = subscriptionData?.plan || 'free'
    const subscription = {
      id: subscriptionData?.id || organizationId,
      plan,
      status: subscriptionData?.status || 'active',
      dodo_customer_id: subscriptionData?.stripe_customer_id || null,
      dodo_subscription_id: subscriptionData?.stripe_subscription_id || null,
      dodo_product_id: null,
      current_period_start: subscriptionData?.current_period_start || startOfMonth.toISOString(),
      current_period_end: subscriptionData?.current_period_end || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
      cancel_at_period_end: subscriptionData?.cancel_at_period_end || false,
    }

    return NextResponse.json({
      subscription,
      usage: { 
        emails_sent: emailsSent, 
        emails_limit: planLimits[plan] || 5000,
      },
      invoices: invoices || [],
    })
  } catch (error) {
    console.error('Billing fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch billing info' }, { status: 500 })
  }
}

// POST - Handle billing actions (cancel subscription, etc.)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, organizationId } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Check user has admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (action === 'cancel') {
      // Mark subscription for cancellation at period end
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', organizationId)

      if (error) {
        console.error('Error marking subscription for cancellation:', error)
        return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Billing error:', error)
    return NextResponse.json({ error: 'Billing operation failed' }, { status: 500 })
  }
}
