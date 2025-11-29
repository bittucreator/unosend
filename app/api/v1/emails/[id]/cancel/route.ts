import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

// Cancel a queued email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate API key
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  // Get the email
  const { data: email, error } = await supabaseAdmin
    .from('emails')
    .select('id, status')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !email) {
    return apiError('Email not found', 404)
  }

  // Only allow canceling queued emails
  if (email.status !== 'queued') {
    return apiError('Can only cancel queued emails. This email has already been processed.', 400)
  }

  // Update status to cancelled
  const { error: updateError } = await supabaseAdmin
    .from('emails')
    .update({ 
      status: 'cancelled',
      metadata: {
        cancelled_at: new Date().toISOString()
      }
    })
    .eq('id', id)

  if (updateError) {
    console.error('Failed to cancel email:', updateError)
    return apiError('Failed to cancel email', 500)
  }

  // Create email event
  await supabaseAdmin
    .from('email_events')
    .insert({
      email_id: id,
      event_type: 'cancelled',
    })

  return apiSuccess({
    id,
    status: 'cancelled',
    message: 'Email cancelled successfully',
  })
}
