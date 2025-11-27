import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  const { data: apiKey, error: fetchError } = await supabaseAdmin
    .from('api_keys')
    .select('id')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .is('revoked_at', null)
    .single()

  if (fetchError || !apiKey) {
    return apiError('API key not found', 404)
  }

  const { error: updateError } = await supabaseAdmin
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    return apiError('Failed to revoke API key', 500)
  }

  return apiSuccess({ message: 'API key revoked successfully' })
}
