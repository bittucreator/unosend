import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// POST - Duplicate a template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  // Get original template
  const { data: original, error: fetchError } = await supabaseAdmin
    .from('templates')
    .select('*')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (fetchError || !original) {
    return apiError('Template not found', 404)
  }

  // Get optional name from request body
  let newName = `${original.name} (Copy)`
  try {
    const body = await request.json()
    if (body.name) {
      newName = body.name
    }
  } catch {
    // Use default name
  }

  // Create duplicate
  const { data: duplicate, error: createError } = await supabaseAdmin
    .from('templates')
    .insert({
      organization_id: context.organizationId,
      name: newName,
      subject: original.subject,
      html_content: original.html_content,
      text_content: original.text_content,
      variables: original.variables,
    })
    .select()
    .single()

  if (createError) {
    console.error('Failed to duplicate template:', createError)
    return apiError('Failed to duplicate template', 500)
  }

  return apiSuccess({
    id: duplicate.id,
    name: duplicate.name,
    subject: duplicate.subject,
    html: duplicate.html_content,
    text: duplicate.text_content,
    variables: duplicate.variables,
    created_at: duplicate.created_at,
  }, 201)
}
