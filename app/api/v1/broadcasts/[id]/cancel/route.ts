import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// Cancel a scheduled broadcast
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  // Get broadcast
  const { data: broadcast, error: fetchError } = await supabaseAdmin
    .from('broadcasts')
    .select('id, status')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (fetchError || !broadcast) {
    return apiError('Broadcast not found', 404)
  }

  // Can only cancel scheduled broadcasts
  if (broadcast.status !== 'scheduled') {
    return apiError(`Cannot cancel broadcast with status "${broadcast.status}". Only scheduled broadcasts can be cancelled.`, 400)
  }

  // Update status to cancelled
  const { error: updateError } = await supabaseAdmin
    .from('broadcasts')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    console.error('Failed to cancel broadcast:', updateError)
    return apiError('Failed to cancel broadcast', 500)
  }

  return apiSuccess({
    id,
    status: 'cancelled',
    message: 'Broadcast cancelled successfully',
  })
}
