import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
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

  // Get the webhook with secret
  const { data: webhook, error } = await supabase
    .from('webhooks')
    .select('id, url, secret, events')
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (error || !webhook) {
    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
  }

  // Send test webhook
  const testPayload = {
    type: 'test',
    data: {
      email_id: 'test_' + Math.random().toString(36).substring(7),
      from: 'test@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Email',
      message: 'This is a test webhook from Unosend',
    },
    created_at: new Date().toISOString(),
  }

  const timestamp = Date.now()
  const body = JSON.stringify(testPayload)
  
  // Generate signature
  const crypto = await import('crypto')
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(`${timestamp}.${body}`)
    .digest('hex')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Unosend-Signature': signature,
        'X-Unosend-Timestamp': timestamp.toString(),
        'X-Unosend-Webhook-Id': webhook.id,
        'X-Unosend-Test': 'true',
      },
      body,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Log the test delivery
    await supabase
      .from('webhook_logs')
      .insert({
        webhook_id: webhook.id,
        event_type: 'test',
        payload: testPayload,
        response_status: response.status,
        success: response.ok,
        error: response.ok ? null : `HTTP ${response.status}`,
        metadata: { test: true }
      })

    return NextResponse.json({
      success: response.ok,
      status_code: response.status,
      message: response.ok ? 'Test webhook sent successfully' : `Webhook returned HTTP ${response.status}`,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    // Log the failed test
    await supabase
      .from('webhook_logs')
      .insert({
        webhook_id: webhook.id,
        event_type: 'test',
        payload: testPayload,
        response_status: null,
        success: false,
        error: errorMessage,
        metadata: { test: true }
      })

    return NextResponse.json({
      success: false,
      message: `Failed to send test webhook: ${errorMessage}`,
    })
  }
}
