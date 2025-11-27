import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const updateContactSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  audience_id: z.string().uuid().nullable().optional(),
  subscribed: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
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

  const { data: contact, error } = await supabaseAdmin
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !contact) {
    return apiError('Contact not found', 404)
  }

  return apiSuccess(contact)
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
    const validationResult = updateContactSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.email) updates.email = body.email
    if (body.first_name !== undefined) updates.first_name = body.first_name
    if (body.last_name !== undefined) updates.last_name = body.last_name
    if (body.audience_id !== undefined) updates.audience_id = body.audience_id
    if (body.subscribed !== undefined) updates.subscribed = body.subscribed
    if (body.metadata) updates.metadata = body.metadata

    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', context.organizationId)
      .select()
      .single()

    if (error || !contact) {
      return apiError('Contact not found', 404)
    }

    return apiSuccess(contact)
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
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('organization_id', context.organizationId)

  if (error) {
    return apiError('Failed to delete contact', 500)
  }

  return apiSuccess({ message: 'Contact deleted successfully' })
}
