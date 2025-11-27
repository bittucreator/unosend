import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const createContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  audience_id: z.string().uuid().optional(),
  subscribed: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  try {
    const body = await request.json()
    
    const validationResult = createContactSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { email, first_name, last_name, audience_id, subscribed, metadata } = validationResult.data

    // Check if contact already exists
    const { data: existing } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('organization_id', context.organizationId)
      .eq('email', email)
      .single()

    if (existing) {
      return apiError('Contact with this email already exists', 409)
    }

    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        organization_id: context.organizationId,
        email,
        first_name,
        last_name,
        audience_id,
        subscribed: subscribed ?? true,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create contact:', error)
      return apiError('Failed to create contact', 500)
    }

    return apiSuccess({
      id: contact.id,
      email: contact.email,
      first_name: contact.first_name,
      last_name: contact.last_name,
      audience_id: contact.audience_id,
      subscribed: contact.subscribed,
      metadata: contact.metadata,
      created_at: contact.created_at,
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

  const { searchParams } = new URL(request.url)
  const audienceId = searchParams.get('audience_id')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabaseAdmin
    .from('contacts')
    .select('id, email, first_name, last_name, audience_id, subscribed, metadata, created_at, updated_at')
    .eq('organization_id', context.organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (audienceId) {
    query = query.eq('audience_id', audienceId)
  }

  const { data: contacts, error } = await query

  if (error) {
    return apiError('Failed to fetch contacts', 500)
  }

  return apiSuccess({ data: contacts })
}
