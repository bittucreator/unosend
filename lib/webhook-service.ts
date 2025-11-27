import { supabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'

interface WebhookPayload {
  type: string
  data: {
    email_id: string
    from?: string
    to?: string[]
    subject?: string
    [key: string]: unknown
  }
  created_at: string
}

// Generate HMAC signature for webhook
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

// Deliver webhook to a single endpoint
async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const body = JSON.stringify(payload)
  const timestamp = Date.now()
  const signature = generateSignature(`${timestamp}.${body}`, secret)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Unosend-Signature': signature,
        'X-Unosend-Timestamp': timestamp.toString(),
        'X-Unosend-Webhook-Id': webhookId,
      },
      body,
    })

    return {
      success: response.ok,
      statusCode: response.status,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Send webhook to all registered endpoints for an event type
export async function sendWebhooks(
  organizationId: string,
  eventType: string,
  data: WebhookPayload['data']
) {
  // Get all enabled webhooks for this organization that subscribe to this event
  const { data: webhooks } = await supabaseAdmin
    .from('webhooks')
    .select('id, url, secret, events')
    .eq('organization_id', organizationId)
    .eq('enabled', true)

  if (!webhooks || webhooks.length === 0) {
    return
  }

  const payload: WebhookPayload = {
    type: eventType,
    data,
    created_at: new Date().toISOString(),
  }

  // Deliver to each webhook that subscribes to this event
  for (const webhook of webhooks) {
    const events = webhook.events as string[]
    if (!events.includes(eventType)) {
      continue
    }

    const result = await deliverWebhook(
      webhook.id,
      webhook.url,
      webhook.secret,
      payload
    )

    // Log webhook delivery
    await supabaseAdmin
      .from('webhook_logs')
      .insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        response_status: result.statusCode,
        success: result.success,
        error: result.error,
      })
  }
}

// Trigger webhook for email event
export async function triggerEmailWebhook(
  organizationId: string,
  eventType: 'email.sent' | 'email.delivered' | 'email.bounced' | 'email.complained' | 'email.opened' | 'email.clicked' | 'email.failed',
  emailId: string,
  additionalData?: Record<string, unknown>
) {
  // Get email details
  const { data: email } = await supabaseAdmin
    .from('emails')
    .select('from_email, to_emails, subject')
    .eq('id', emailId)
    .single()

  if (!email) {
    return
  }

  await sendWebhooks(organizationId, eventType, {
    email_id: emailId,
    from: email.from_email,
    to: email.to_emails,
    subject: email.subject,
    ...additionalData,
  })
}
