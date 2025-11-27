import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const updateWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL').optional(),
  events: z.array(z.enum([
    'email.sent',
    'email.delivered',
    'email.bounced',
    'email.complained',
    'email.opened',
    'email.clicked',
    'email.failed'
  ])).min(1).optional(),
  enabled: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  const { data: webhook, error } = await supabaseAdmin
    .from('webhooks')
    .select('id, url, events, enabled, created_at')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !webhook) {
    return apiError('Webhook not found', 404)
  }

  return apiSuccess(webhook)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  try {
    const body = await request.json()
    
    const validationResult = updateWebhookSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const updates = validationResult.data

    const { data: webhook, error } = await supabaseAdmin
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', context.organizationId)
      .select('id, url, events, enabled, created_at')
      .single()

    if (error || !webhook) {
      return apiError('Webhook not found', 404)
    }

    return apiSuccess(webhook)
  } catch {
    return apiError('Invalid request body', 400)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('webhooks')
    .delete()
    .eq('id', id)
    .eq('organization_id', context.organizationId)

  if (error) {
    return apiError('Failed to delete webhook', 500)
  }

  return apiSuccess({ message: 'Webhook deleted successfully' })
}
