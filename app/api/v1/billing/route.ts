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

    // Get organization with billing info
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get usage for current period
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get payment history/invoices (if table exists)
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Build subscription object from organization data
    const subscription = {
      id: organization.id,
      plan: organization.plan || 'free',
      status: organization.billing_status || 'active',
      dodo_customer_id: organization.dodo_customer_id,
      dodo_subscription_id: organization.dodo_subscription_id,
      dodo_product_id: organization.dodo_product_id,
      current_period_start: organization.billing_cycle_start || new Date().toISOString(),
      current_period_end: organization.billing_cycle_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: organization.cancel_at_period_end || false,
    }

    return NextResponse.json({
      subscription,
      usage: usage || { emails_sent: 0, emails_limit: organization.email_limit || 5000 },
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
        .from('organizations')
        .update({ 
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organizationId)

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
