import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'
import { generateWebhookSecret } from '@/lib/api-utils'

const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.enum([
    'email.sent',
    'email.delivered',
    'email.bounced',
    'email.complained',
    'email.opened',
    'email.clicked',
    'email.failed'
  ])).min(1, 'At least one event type is required'),
})

export async function POST(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  try {
    const body = await request.json()
    
    const validationResult = createWebhookSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { url, events } = validationResult.data
    const secret = generateWebhookSecret()

    const { data: webhook, error } = await supabaseAdmin
      .from('webhooks')
      .insert({
        organization_id: context.organizationId,
        url,
        events,
        secret,
        enabled: true,
      })
      .select('id, url, events, enabled, created_at')
      .single()

    if (error) {
      console.error('Failed to create webhook:', error)
      return apiError('Failed to create webhook', 500)
    }

    return apiSuccess({
      ...webhook,
      secret, // Only returned once on creation
    }, 201)
  } catch {
    return apiError('Invalid request body', 400)
  }
}

export async function GET(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { data: webhooks, error } = await supabaseAdmin
    .from('webhooks')
    .select('id, url, events, enabled, created_at')
    .eq('organization_id', context.organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    return apiError('Failed to fetch webhooks', 500)
  }

  return apiSuccess({ data: webhooks })
}
