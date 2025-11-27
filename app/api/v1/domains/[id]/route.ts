import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// Get single domain
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  const { data: domain, error } = await supabaseAdmin
    .from('domains')
    .select('id, domain, status, dns_records, verified_at, created_at')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !domain) {
    return apiError('Domain not found', 404)
  }

  return apiSuccess(domain)
}

// Delete domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  const { data: domain, error: fetchError } = await supabaseAdmin
    .from('domains')
    .select('id')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (fetchError || !domain) {
    return apiError('Domain not found', 404)
  }

  const { error: deleteError } = await supabaseAdmin
    .from('domains')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return apiError('Failed to delete domain', 500)
  }

  return apiSuccess({ message: 'Domain deleted successfully' })
}
