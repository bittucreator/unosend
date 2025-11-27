import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const updateBroadcastSchema = z.object({
  name: z.string().min(1).optional(),
  from: z.string().optional(),
  subject: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  audience_id: z.string().uuid().nullable().optional(),
  scheduled_at: z.string().datetime().nullable().optional(),
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

  const { data: broadcast, error } = await supabaseAdmin
    .from('broadcasts')
    .select('*')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !broadcast) {
    return apiError('Broadcast not found', 404)
  }

  return apiSuccess({
    id: broadcast.id,
    name: broadcast.name,
    from: broadcast.from_name ? `${broadcast.from_name} <${broadcast.from_email}>` : broadcast.from_email,
    subject: broadcast.subject,
    html: broadcast.html_content,
    text: broadcast.text_content,
    status: broadcast.status,
    audience_id: broadcast.audience_id,
    template_id: broadcast.template_id,
    total_recipients: broadcast.total_recipients,
    sent_count: broadcast.sent_count,
    scheduled_at: broadcast.scheduled_at,
    sent_at: broadcast.sent_at,
    created_at: broadcast.created_at,
    updated_at: broadcast.updated_at,
  })
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
    const validationResult = updateBroadcastSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    // Check current status - can only update draft/scheduled
    const { data: existing } = await supabaseAdmin
      .from('broadcasts')
      .select('status')
      .eq('id', id)
      .eq('organization_id', context.organizationId)
      .single()

    if (!existing) {
      return apiError('Broadcast not found', 404)
    }

    if (!['draft', 'scheduled'].includes(existing.status)) {
      return apiError('Cannot update broadcast that is already sending or sent', 400)
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    
    if (body.name) updates.name = body.name
    if (body.subject) updates.subject = body.subject
    if (body.html !== undefined) updates.html_content = body.html
    if (body.text !== undefined) updates.text_content = body.text
    if (body.audience_id !== undefined) updates.audience_id = body.audience_id
    if (body.scheduled_at !== undefined) {
      updates.scheduled_at = body.scheduled_at
      updates.status = body.scheduled_at ? 'scheduled' : 'draft'
    }

    if (body.from) {
      const fromMatch = body.from.match(/^(.+?)\s*<(.+?)>$/)
      updates.from_email = fromMatch ? fromMatch[2] : body.from
      updates.from_name = fromMatch ? fromMatch[1].trim() : null
    }

    const { data: broadcast, error } = await supabaseAdmin
      .from('broadcasts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', context.organizationId)
      .select()
      .single()

    if (error || !broadcast) {
      return apiError('Failed to update broadcast', 500)
    }

    return apiSuccess({
      id: broadcast.id,
      name: broadcast.name,
      status: broadcast.status,
      updated_at: broadcast.updated_at,
    })
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

  // Check status - cannot delete sending broadcasts
  const { data: existing } = await supabaseAdmin
    .from('broadcasts')
    .select('status')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (!existing) {
    return apiError('Broadcast not found', 404)
  }

  if (existing.status === 'sending') {
    return apiError('Cannot delete broadcast that is currently sending', 400)
  }

  const { error } = await supabaseAdmin
    .from('broadcasts')
    .delete()
    .eq('id', id)
    .eq('organization_id', context.organizationId)

  if (error) {
    return apiError('Failed to delete broadcast', 500)
  }

  return apiSuccess({ message: 'Broadcast deleted successfully' })
}
