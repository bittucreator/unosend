import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const createAudienceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  try {
    const body = await request.json()
    
    const validationResult = createAudienceSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { name, description } = validationResult.data

    const { data: audience, error } = await supabaseAdmin
      .from('audiences')
      .insert({
        organization_id: context.organizationId,
        name,
        description,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create audience:', error)
      return apiError('Failed to create audience', 500)
    }

    return apiSuccess({
      id: audience.id,
      name: audience.name,
      description: audience.description,
      created_at: audience.created_at,
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

  // Get audiences with contact count
  const { data: audiences, error } = await supabaseAdmin
    .from('audiences')
    .select(`
      id,
      name,
      description,
      created_at,
      updated_at,
      contacts(count)
    `)
    .eq('organization_id', context.organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    return apiError('Failed to fetch audiences', 500)
  }

  return apiSuccess({
    data: audiences.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      contacts_count: (a.contacts as unknown as { count: number }[])?.[0]?.count || 0,
      created_at: a.created_at,
      updated_at: a.updated_at,
    })),
  })
}
