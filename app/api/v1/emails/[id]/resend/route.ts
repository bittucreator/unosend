import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { emailService } from '@/lib/email-service'
import { validateApiKey, apiError, apiSuccess, checkUsageLimit } from '@/lib/api-middleware'
import { triggerEmailWebhook } from '@/lib/webhook-service'

// Resend a failed/bounced email
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

  // Get the original email
  const { data: email, error } = await supabaseAdmin
    .from('emails')
    .select('*')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (error || !email) {
    return apiError('Email not found', 404)
  }

  // Only allow resending failed or bounced emails
  if (!['failed', 'bounced'].includes(email.status)) {
    return apiError('Can only resend failed or bounced emails', 400)
  }

  // Check usage limits
  const usageLimit = await checkUsageLimit(context.organizationId)
  if (!usageLimit.allowed) {
    return apiError(
      `Monthly email limit exceeded. You've sent ${usageLimit.current.toLocaleString()} of ${usageLimit.limit.toLocaleString()} emails.`,
      402
    )
  }

  try {
    // Create a new email record for the resend
    const { data: newEmail, error: insertError } = await supabaseAdmin
      .from('emails')
      .insert({
        organization_id: context.organizationId,
        api_key_id: context.apiKeyId,
        from_email: email.from_email,
        from_name: email.from_name,
        to_emails: email.to_emails,
        cc_emails: email.cc_emails,
        bcc_emails: email.bcc_emails,
        reply_to: email.reply_to,
        subject: email.subject,
        html_content: email.html_content,
        text_content: email.text_content,
        status: 'queued',
        metadata: { 
          ...email.metadata,
          resent_from: id 
        },
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create resend email record:', insertError)
      return apiError('Failed to resend email', 500)
    }

    // Prepare email input for sending
    const input = {
      from: email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email,
      to: email.to_emails,
      cc: email.cc_emails || undefined,
      bcc: email.bcc_emails || undefined,
      reply_to: email.reply_to || undefined,
      subject: email.subject,
      html: email.html_content || undefined,
      text: email.text_content || undefined,
    }

    // Send the email
    const result = await emailService.sendEmail(input, email.from_name || undefined, {
      emailId: newEmail.id,
      trackOpens: true,
      trackClicks: true,
    })

    // Update email status to sent
    await supabaseAdmin
      .from('emails')
      .update({
        status: 'sent',
        provider_message_id: result.messageId,
        sent_at: new Date().toISOString(),
      })
      .eq('id', newEmail.id)

    // Create email event
    await supabaseAdmin
      .from('email_events')
      .insert({
        email_id: newEmail.id,
        event_type: 'sent',
        metadata: { resent_from: id },
      })

    // Trigger webhook
    await triggerEmailWebhook(context.organizationId, 'email.sent', newEmail.id)

    // Update usage
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { data: existingUsage } = await supabaseAdmin
      .from('usage')
      .select('id, emails_sent')
      .eq('organization_id', context.organizationId)
      .eq('period_start', periodStart)
      .single()

    if (existingUsage) {
      await supabaseAdmin
        .from('usage')
        .update({ emails_sent: existingUsage.emails_sent + 1 })
        .eq('id', existingUsage.id)
    } else {
      await supabaseAdmin
        .from('usage')
        .insert({
          organization_id: context.organizationId,
          period_start: periodStart,
          period_end: periodEnd,
          emails_sent: 1,
        })
    }

    return apiSuccess({
      id: newEmail.id,
      original_id: id,
      from: input.from,
      to: email.to_emails,
      created_at: newEmail.created_at,
    })

  } catch (error) {
    console.error('Failed to resend email:', error)
    return apiError(
      `Failed to resend email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}
