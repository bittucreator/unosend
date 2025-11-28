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

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 5,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 300000, // 5 minutes
  backoffMultiplier: 2,
}

// Generate HMAC signature for webhook
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

// Calculate delay with exponential backoff
function getRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelayMs)
}

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Deliver webhook to a single endpoint with retries
async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; error?: string; attempts: number }> {
  const body = JSON.stringify(payload)
  const timestamp = Date.now()
  const signature = generateSignature(`${timestamp}.${body}`, secret)

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Unosend-Signature': signature,
          'X-Unosend-Timestamp': timestamp.toString(),
          'X-Unosend-Webhook-Id': webhookId,
          'X-Unosend-Retry-Attempt': attempt.toString(),
        },
        body,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Success - 2xx status codes
      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          attempts: attempt + 1,
        }
      }

      // Don't retry on 4xx errors (except 429 rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return {
          success: false,
          statusCode: response.status,
          error: `HTTP ${response.status}`,
          attempts: attempt + 1,
        }
      }

      // Retry on 5xx or 429
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = getRetryDelay(attempt)
        console.log(`Webhook delivery failed (attempt ${attempt + 1}), retrying in ${delay}ms`)
        await sleep(delay)
      } else {
        return {
          success: false,
          statusCode: response.status,
          error: `Failed after ${attempt + 1} attempts: HTTP ${response.status}`,
          attempts: attempt + 1,
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Retry on network errors
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = getRetryDelay(attempt)
        console.log(`Webhook delivery error (attempt ${attempt + 1}): ${errorMessage}, retrying in ${delay}ms`)
        await sleep(delay)
      } else {
        return {
          success: false,
          error: `Failed after ${attempt + 1} attempts: ${errorMessage}`,
          attempts: attempt + 1,
        }
      }
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded',
    attempts: RETRY_CONFIG.maxRetries + 1,
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

    // Log webhook delivery with retry info
    await supabaseAdmin
      .from('webhook_logs')
      .insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        response_status: result.statusCode,
        success: result.success,
        error: result.error,
        metadata: { attempts: result.attempts }
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
