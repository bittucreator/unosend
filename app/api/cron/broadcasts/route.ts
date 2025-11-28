import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { emailService } from '@/lib/email-service'

// Process scheduled broadcasts (called by cron job)
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date().toISOString()

    // Get scheduled broadcasts that are due
    const { data: broadcasts, error } = await supabaseAdmin
      .from('broadcasts')
      .select(`
        *,
        audiences:audience_id (
          id,
          name
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .limit(10)

    if (error) {
      console.error('Error fetching broadcasts:', error)
      return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 })
    }

    if (!broadcasts || broadcasts.length === 0) {
      return NextResponse.json({ message: 'No broadcasts to process', processed: 0 })
    }

    const results = []

    for (const broadcast of broadcasts) {
      try {
        // Update status to sending
        await supabaseAdmin
          .from('broadcasts')
          .update({ status: 'sending' })
          .eq('id', broadcast.id)

        // Get contacts from audience
        const { data: contacts, error: contactsError } = await supabaseAdmin
          .from('contacts')
          .select('id, email, first_name, last_name')
          .eq('audience_id', broadcast.audience_id)
          .eq('subscribed', true)

        if (contactsError || !contacts) {
          throw new Error('Failed to fetch contacts')
        }

        let sentCount = 0
        let failedCount = 0

        // Send to each contact
        for (const contact of contacts) {
          try {
            // Generate unsubscribe token
            const unsubscribeToken = Buffer.from(`${contact.id}:${Date.now()}`).toString('base64')
            const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe/${unsubscribeToken}`

            // Replace variables
            let html = broadcast.html_content || ''
            html = html.replace(/\{\{\s*first_name\s*\}\}/gi, contact.first_name || '')
            html = html.replace(/\{\{\s*last_name\s*\}\}/gi, contact.last_name || '')
            html = html.replace(/\{\{\s*email\s*\}\}/gi, contact.email)
            html = html.replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, unsubscribeUrl)

            // Create email record
            const { data: emailRecord } = await supabaseAdmin
              .from('emails')
              .insert({
                organization_id: broadcast.organization_id,
                broadcast_id: broadcast.id,
                to_email: contact.email,
                from_email: broadcast.from_email,
                from_name: broadcast.from_name,
                subject: broadcast.subject,
                html_content: html,
                status: 'sending',
              })
              .select('id')
              .single()

            // Send email
            let sendResult: { id: string; messageId: string } | null = null
            let sendError: string | null = null
            
            try {
              sendResult = await emailService.sendEmail({
                to: contact.email,
                from: broadcast.from_email,
                subject: broadcast.subject,
                html: html,
              }, broadcast.from_name || undefined)
            } catch (err) {
              sendError = err instanceof Error ? err.message : 'Unknown error'
            }

            // Update email status
            await supabaseAdmin
              .from('emails')
              .update({
                status: sendResult ? 'delivered' : 'failed',
                message_id: sendResult?.messageId || null,
                sent_at: sendResult ? new Date().toISOString() : null,
                error: sendError,
              })
              .eq('id', emailRecord?.id)

            if (sendResult) {
              sentCount++
            } else {
              failedCount++
            }

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 50))

          } catch (err) {
            console.error(`Failed to send to ${contact.email}:`, err)
            failedCount++
          }
        }

        // Update broadcast status
        await supabaseAdmin
          .from('broadcasts')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            sent_count: sentCount,
            total_recipients: contacts.length,
          })
          .eq('id', broadcast.id)

        results.push({
          broadcastId: broadcast.id,
          name: broadcast.name,
          sent: sentCount,
          failed: failedCount,
          total: contacts.length,
        })

      } catch (err) {
        console.error(`Failed to process broadcast ${broadcast.id}:`, err)
        
        // Mark as failed
        await supabaseAdmin
          .from('broadcasts')
          .update({ status: 'failed' })
          .eq('id', broadcast.id)

        results.push({
          broadcastId: broadcast.id,
          name: broadcast.name,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      message: 'Broadcasts processed',
      processed: results.length,
      results,
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

// GET endpoint to check cron status
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Broadcast cron endpoint ready',
    time: new Date().toISOString()
  })
}
