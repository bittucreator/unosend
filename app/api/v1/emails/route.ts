import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { emailService } from '@/lib/email-service'
import { validateApiKey, rateLimit, apiError, apiSuccess, withRateLimitHeaders, checkUsageLimit } from '@/lib/api-middleware'
import { sendEmailSchema } from '@/lib/validations'
import { triggerEmailWebhook } from '@/lib/webhook-service'

export async function POST(request: NextRequest) {
  // Validate API key
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  // Rate limiting
  const rateLimitResult = rateLimit(context.organizationId)
  if (!rateLimitResult.allowed) {
    const response = apiError('Rate limit exceeded', 429)
    return withRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetAt)
  }

  // Check usage limits based on plan
  const usageLimit = await checkUsageLimit(context.organizationId)
  if (!usageLimit.allowed) {
    return apiError(
      `Monthly email limit exceeded. You've sent ${usageLimit.current.toLocaleString()} of ${usageLimit.limit.toLocaleString()} emails on the ${usageLimit.plan} plan. Upgrade your plan to continue sending emails.`,
      402 // Payment Required
    )
  }

  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = sendEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const input = validationResult.data
    const toEmails = Array.isArray(input.to) ? input.to : [input.to]
    const ccEmails = input.cc ? (Array.isArray(input.cc) ? input.cc : [input.cc]) : null
    const bccEmails = input.bcc ? (Array.isArray(input.bcc) ? input.bcc : [input.bcc]) : null

    // Extract from name and email
    const fromMatch = input.from.match(/^(.+?)\s*<(.+?)>$/)
    const fromEmail = fromMatch ? fromMatch[2] : input.from
    const fromName = fromMatch ? fromMatch[1].trim() : null

    // Create email record
    const { data: email, error: insertError } = await supabaseAdmin
      .from('emails')
      .insert({
        organization_id: context.organizationId,
        api_key_id: context.apiKeyId,
        from_email: fromEmail,
        from_name: fromName,
        to_emails: toEmails,
        cc_emails: ccEmails,
        bcc_emails: bccEmails,
        reply_to: input.reply_to,
        subject: input.subject,
        html_content: input.html,
        text_content: input.text,
        status: 'queued',
        metadata: input.tags ? { tags: input.tags } : null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create email record:', insertError)
      return apiError('Failed to queue email', 500)
    }

    // Send email
    try {
      const result = await emailService.sendEmail(input, fromName || undefined, {
        emailId: email.id,
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
        .eq('id', email.id)

      // Create email event
      await supabaseAdmin
        .from('email_events')
        .insert({
          email_id: email.id,
          event_type: 'sent',
        })

      // Trigger webhook
      await triggerEmailWebhook(context.organizationId, 'email.sent', email.id)

      // Update usage stats - use RPC for atomic increment
      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      // Try to increment existing record, or insert new one
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

      const response = apiSuccess({
        id: email.id,
        from: input.from,
        to: toEmails,
        created_at: email.created_at,
      }, 200)

      return withRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetAt)
    } catch (sendError) {
      // Update email status to failed
      await supabaseAdmin
        .from('emails')
        .update({ status: 'failed' })
        .eq('id', email.id)

      // Trigger failed webhook
      await triggerEmailWebhook(context.organizationId, 'email.failed', email.id, {
        error: sendError instanceof Error ? sendError.message : 'Unknown error',
      })

      console.error('Failed to send email:', sendError)
      // Return more detailed error for debugging
      const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error'
      return apiError(`Failed to send email: ${errorMessage}`, 500)
    }
  } catch (error) {
    console.error('Email API error:', error)
    return apiError('Invalid request body', 400)
  }
}

export async function GET(request: NextRequest) {
  // Validate API key
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  const { data: emails, error } = await supabaseAdmin
    .from('emails')
    .select('id, from_email, from_name, to_emails, subject, status, created_at, sent_at')
    .eq('organization_id', context.organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return apiError('Failed to fetch emails', 500)
  }

  return apiSuccess({
    data: emails.map(email => ({
      id: email.id,
      from: email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email,
      to: email.to_emails,
      subject: email.subject,
      status: email.status,
      created_at: email.created_at,
      sent_at: email.sent_at,
    })),
  })
}
