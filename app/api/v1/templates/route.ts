import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().optional(),
  text: z.string().optional(),
  variables: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  try {
    const body = await request.json()
    
    const validationResult = createTemplateSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { name, subject, html, text, variables } = validationResult.data

    const { data: template, error } = await supabaseAdmin
      .from('templates')
      .insert({
        organization_id: context.organizationId,
        name,
        subject,
        html_content: html,
        text_content: text,
        variables: variables || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create template:', error)
      return apiError('Failed to create template', 500)
    }

    return apiSuccess({
      id: template.id,
      name: template.name,
      subject: template.subject,
      html: template.html_content,
      text: template.text_content,
      variables: template.variables,
      created_at: template.created_at,
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

  const { data: templates, error } = await supabaseAdmin
    .from('templates')
    .select('id, name, subject, html_content, text_content, variables, created_at, updated_at')
    .eq('organization_id', context.organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    return apiError('Failed to fetch templates', 500)
  }

  return apiSuccess({
    data: templates.map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      html: t.html_content,
      text: t.text_content,
      variables: t.variables,
      created_at: t.created_at,
      updated_at: t.updated_at,
    })),
  })
}
