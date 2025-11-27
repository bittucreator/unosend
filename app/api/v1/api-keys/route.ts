import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { createApiKeySchema } from '@/lib/validations'
import { generateApiKey } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  try {
    const body = await request.json()
    
    const validationResult = createApiKeySchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { name } = validationResult.data
    const { key, hash, prefix } = generateApiKey()

    const { data: apiKey, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        organization_id: context.organizationId,
        name,
        key_hash: hash,
        key_prefix: prefix,
      })
      .select('id, name, key_prefix, created_at')
      .single()

    if (error) {
      console.error('Failed to create API key:', error)
      return apiError('Failed to create API key', 500)
    }

    // Return the full key only once - it cannot be retrieved again
    return apiSuccess({
      id: apiKey.id,
      name: apiKey.name,
      key: key, // This is the only time the full key is returned
      key_prefix: apiKey.key_prefix,
      created_at: apiKey.created_at,
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

  const { data: apiKeys, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, created_at, revoked_at')
    .eq('organization_id', context.organizationId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return apiError('Failed to fetch API keys', 500)
  }

  return apiSuccess({ data: apiKeys })
}
