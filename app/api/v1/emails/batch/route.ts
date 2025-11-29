import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { emailService } from '@/lib/email-service'
import { validateApiKey, rateLimit, apiError, apiSuccess, withRateLimitHeaders, checkUsageLimit } from '@/lib/api-middleware'
import { sendEmailSchema } from '@/lib/validations'
import { triggerEmailWebhook } from '@/lib/webhook-service'
import { z } from 'zod'

// Batch email schema - array of emails
const batchEmailSchema = z.array(sendEmailSchema).min(1).max(100)

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

  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = batchEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const emails = validationResult.data

    // Check usage limits - need enough capacity for all emails
    const usageLimit = await checkUsageLimit(context.organizationId)
    if (!usageLimit.allowed) {
      return apiError(
        `Monthly email limit exceeded. You've sent ${usageLimit.current.toLocaleString()} of ${usageLimit.limit.toLocaleString()} emails.`,
        402
      )
    }

    // Check if we have enough remaining
    if (usageLimit.limit !== -1 && usageLimit.remaining < emails.length) {
      return apiError(
        `Batch size exceeds remaining quota. You have ${usageLimit.remaining} emails remaining this month.`,
        402
      )
    }

    const results: Array<{ id: string; from: string; to: string[]; created_at: string } | { error: string; index: number }> = []

    // Process each email
    for (let i = 0; i < emails.length; i++) {
      const input = emails[i]
      
      try {
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
          results.push({ error: 'Failed to queue email', index: i })
          continue
        }

        // Send email
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

        results.push({
          id: email.id,
          from: input.from,
          to: toEmails,
          created_at: email.created_at,
        })

      } catch (error) {
        console.error(`Failed to send email at index ${i}:`, error)
        results.push({ 
          error: error instanceof Error ? error.message : 'Failed to send', 
          index: i 
        })
      }
    }

    // Update usage stats
    const successCount = results.filter(r => 'id' in r).length
    if (successCount > 0) {
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
          .update({ emails_sent: existingUsage.emails_sent + successCount })
          .eq('id', existingUsage.id)
      } else {
        await supabaseAdmin
          .from('usage')
          .insert({
            organization_id: context.organizationId,
            period_start: periodStart,
            period_end: periodEnd,
            emails_sent: successCount,
          })
      }
    }

    const response = apiSuccess({
      data: results,
      success_count: successCount,
      error_count: results.filter(r => 'error' in r).length,
    }, 200)

    return withRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetAt)

  } catch (error) {
    console.error('Batch email API error:', error)
    return apiError('Invalid request body', 400)
  }
}
