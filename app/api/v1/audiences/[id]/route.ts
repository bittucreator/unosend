import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const updateAudienceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
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

  const { data: audience, error } = await supabaseAdmin
    .from('audiences')
    .select(`
      id,
      name,
      description,
      created_at,
      updated_at,
      contacts(count)
    `)
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !audience) {
    return apiError('Audience not found', 404)
  }

  return apiSuccess({
    id: audience.id,
    name: audience.name,
    description: audience.description,
    contacts_count: (audience.contacts as unknown as { count: number }[])?.[0]?.count || 0,
    created_at: audience.created_at,
    updated_at: audience.updated_at,
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
    const validationResult = updateAudienceSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description

    const { data: audience, error } = await supabaseAdmin
      .from('audiences')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', context.organizationId)
      .select()
      .single()

    if (error || !audience) {
      return apiError('Audience not found', 404)
    }

    return apiSuccess({
      id: audience.id,
      name: audience.name,
      description: audience.description,
      updated_at: audience.updated_at,
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

  const { error } = await supabaseAdmin
    .from('audiences')
    .delete()
    .eq('id', id)
    .eq('organization_id', context.organizationId)

  if (error) {
    return apiError('Failed to delete audience', 500)
  }

  return apiSuccess({ message: 'Audience deleted successfully' })
}
