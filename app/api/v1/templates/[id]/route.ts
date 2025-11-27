import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  variables: z.array(z.string()).optional(),
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

  const { data: template, error } = await supabaseAdmin
    .from('templates')
    .select('*')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !template) {
    return apiError('Template not found', 404)
  }

  return apiSuccess({
    id: template.id,
    name: template.name,
    subject: template.subject,
    html: template.html_content,
    text: template.text_content,
    variables: template.variables,
    created_at: template.created_at,
    updated_at: template.updated_at,
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
    const validationResult = updateTemplateSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name) updates.name = body.name
    if (body.subject) updates.subject = body.subject
    if (body.html !== undefined) updates.html_content = body.html
    if (body.text !== undefined) updates.text_content = body.text
    if (body.variables) updates.variables = body.variables

    const { data: template, error } = await supabaseAdmin
      .from('templates')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', context.organizationId)
      .select()
      .single()

    if (error || !template) {
      return apiError('Template not found', 404)
    }

    return apiSuccess({
      id: template.id,
      name: template.name,
      subject: template.subject,
      html: template.html_content,
      text: template.text_content,
      variables: template.variables,
      updated_at: template.updated_at,
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
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('organization_id', context.organizationId)

  if (error) {
    return apiError('Failed to delete template', 500)
  }

  return apiSuccess({ message: 'Template deleted successfully' })
}
