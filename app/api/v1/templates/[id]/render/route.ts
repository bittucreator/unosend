import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const renderSchema = z.object({
  data: z.record(z.string(), z.string()).optional(),
})

// POST - Render a template with data (preview)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  // Get template
  const { data: template, error } = await supabaseAdmin
    .from('templates')
    .select('*')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !template) {
    return apiError('Template not found', 404)
  }

  try {
    const body = await request.json().catch(() => ({}))
    const validationResult = renderSchema.safeParse(body)
    
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { data: templateData = {} } = validationResult.data

    // Add default variables
    const variables: Record<string, string> = {
      ...templateData,
      current_year: new Date().getFullYear().toString(),
    }

    // Render subject
    let renderedSubject = template.subject || ''
    for (const [key, value] of Object.entries(variables)) {
      renderedSubject = renderedSubject.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    // Render HTML content
    let renderedHtml = template.html_content || ''
    for (const [key, value] of Object.entries(variables)) {
      renderedHtml = renderedHtml.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    // Render text content
    let renderedText = template.text_content || ''
    for (const [key, value] of Object.entries(variables)) {
      renderedText = renderedText.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    // Find unrendered variables
    const unrenderedPattern = /{{(\w+)}}/g
    const unrenderedVars: string[] = []
    
    let match
    while ((match = unrenderedPattern.exec(renderedHtml)) !== null) {
      if (!unrenderedVars.includes(match[1])) {
        unrenderedVars.push(match[1])
      }
    }
    while ((match = unrenderedPattern.exec(renderedSubject)) !== null) {
      if (!unrenderedVars.includes(match[1])) {
        unrenderedVars.push(match[1])
      }
    }

    return apiSuccess({
      template_id: template.id,
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText,
      unrendered_variables: unrenderedVars,
    })
  } catch {
    return apiError('Invalid request body', 400)
  }
}
