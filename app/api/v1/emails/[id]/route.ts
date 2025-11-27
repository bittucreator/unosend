import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate API key
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  const { data: email, error } = await supabaseAdmin
    .from('emails')
    .select(`
      id,
      from_email,
      from_name,
      to_emails,
      cc_emails,
      bcc_emails,
      reply_to,
      subject,
      html_content,
      text_content,
      status,
      created_at,
      sent_at,
      delivered_at,
      email_events (
        id,
        event_type,
        metadata,
        created_at
      )
    `)
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !email) {
    return apiError('Email not found', 404)
  }

  return apiSuccess({
    id: email.id,
    from: email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email,
    to: email.to_emails,
    cc: email.cc_emails,
    bcc: email.bcc_emails,
    reply_to: email.reply_to,
    subject: email.subject,
    html: email.html_content,
    text: email.text_content,
    status: email.status,
    created_at: email.created_at,
    sent_at: email.sent_at,
    delivered_at: email.delivered_at,
    events: email.email_events,
  })
}
