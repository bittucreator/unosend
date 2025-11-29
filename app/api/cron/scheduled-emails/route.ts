import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { emailService } from '@/lib/email-service'
import { triggerEmailWebhook } from '@/lib/webhook-service'

// Process scheduled emails (called by cron job)
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date().toISOString()

    // Get scheduled emails that are due
    const { data: emails, error } = await supabaseAdmin
      .from('emails')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(50) // Process 50 at a time

    if (error) {
      console.error('Error fetching scheduled emails:', error)
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
    }

    if (!emails || emails.length === 0) {
      return NextResponse.json({ message: 'No scheduled emails to process', processed: 0 })
    }

    let sentCount = 0
    let failedCount = 0
    const results: Array<{ id: string; status: 'sent' | 'failed'; error?: string }> = []

    for (const email of emails) {
      try {
        // Update status to queued (processing)
        await supabaseAdmin
          .from('emails')
          .update({ status: 'queued' })
          .eq('id', email.id)

        // Prepare email input
        const fromAddress = email.from_name 
          ? `${email.from_name} <${email.from_email}>` 
          : email.from_email

        const input = {
          from: fromAddress,
          to: email.to_emails,
          cc: email.cc_emails || undefined,
          bcc: email.bcc_emails || undefined,
          reply_to: email.reply_to || undefined,
          subject: email.subject,
          html: email.html_content || undefined,
          text: email.text_content || undefined,
        }

        // Send email
        const result = await emailService.sendEmail(input, email.from_name || undefined, {
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
        await triggerEmailWebhook(email.organization_id, 'email.sent', email.id)

        // Update usage
        const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()

        const { data: existingUsage } = await supabaseAdmin
          .from('usage')
          .select('id, emails_sent')
          .eq('organization_id', email.organization_id)
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
              organization_id: email.organization_id,
              period_start: periodStart,
              period_end: periodEnd,
              emails_sent: 1,
            })
        }

        sentCount++
        results.push({ id: email.id, status: 'sent' })

      } catch (error) {
        console.error(`Failed to send scheduled email ${email.id}:`, error)
        
        // Update email status to failed
        await supabaseAdmin
          .from('emails')
          .update({ status: 'failed' })
          .eq('id', email.id)

        // Trigger failed webhook
        await triggerEmailWebhook(email.organization_id, 'email.failed', email.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        failedCount++
        results.push({ 
          id: email.id, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${emails.length} scheduled emails`,
      sent: sentCount,
      failed: failedCount,
      results,
    })

  } catch (error) {
    console.error('Scheduled emails cron error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// Also support GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request)
}
