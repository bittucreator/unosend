import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess, checkUsageLimit } from '@/lib/api-middleware'
import { emailService } from '@/lib/email-service'
import { triggerEmailWebhook } from '@/lib/webhook-service'

// Process broadcast sending in batches
const BATCH_SIZE = 50
const BATCH_DELAY_MS = 1000 // 1 second between batches

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
    .select('*')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (fetchError || !broadcast) {
    return apiError('Broadcast not found', 404)
  }

  // Check status
  if (broadcast.status === 'sending') {
    return apiError('Broadcast is already sending', 400)
  }

  if (broadcast.status === 'sent') {
    return apiError('Broadcast has already been sent', 400)
  }

  if (!broadcast.audience_id) {
    return apiError('Broadcast has no audience selected', 400)
  }

  if (!broadcast.html_content && !broadcast.text_content) {
    return apiError('Broadcast has no content', 400)
  }

  // Get contacts from audience
  const { data: contacts, error: contactsError } = await supabaseAdmin
    .from('contacts')
    .select('id, email, first_name, last_name')
    .eq('audience_id', broadcast.audience_id)
    .eq('subscribed', true)

  if (contactsError || !contacts || contacts.length === 0) {
    return apiError('No subscribed contacts in audience', 400)
  }

  // Check usage limits
  const usageLimit = await checkUsageLimit(context.organizationId)
  if (!usageLimit.allowed) {
    return apiError(
      `Monthly email limit exceeded. Cannot send ${contacts.length} emails.`,
      402
    )
  }

  if (usageLimit.current + contacts.length > usageLimit.limit) {
    return apiError(
      `Sending ${contacts.length} emails would exceed your monthly limit of ${usageLimit.limit}. You have ${usageLimit.limit - usageLimit.current} emails remaining.`,
      402
    )
  }

  // Update status to sending
  await supabaseAdmin
    .from('broadcasts')
    .update({ 
      status: 'sending',
      total_recipients: contacts.length,
    })
    .eq('id', id)

  // Start sending in background
  // Note: In production, you'd use a queue system like BullMQ or AWS SQS
  sendBroadcastEmails(broadcast, contacts, context.organizationId, context.apiKeyId)
    .catch(error => {
      console.error('Broadcast sending failed:', error)
      // Update status to failed
      supabaseAdmin
        .from('broadcasts')
        .update({ status: 'failed' })
        .eq('id', id)
    })

  return apiSuccess({
    id: broadcast.id,
    status: 'sending',
    total_recipients: contacts.length,
    message: 'Broadcast is being sent',
  })
}

interface Contact {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

interface Broadcast {
  id: string
  from_email: string
  from_name: string | null
  subject: string
  html_content: string | null
  text_content: string | null
}

async function sendBroadcastEmails(
  broadcast: Broadcast,
  contacts: Contact[],
  organizationId: string,
  apiKeyId: string
) {
  let sentCount = 0
  let failedCount = 0

  // Process in batches
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE)
    
    // Send emails in parallel within batch
    const results = await Promise.allSettled(
      batch.map(async (contact) => {
        const personalizedHtml = personalizeContent(broadcast.html_content, contact)
        const personalizedText = personalizeContent(broadcast.text_content, contact)
        const personalizedSubject = personalizeContent(broadcast.subject, contact)

        // Add tracking pixel to HTML
        const htmlWithTracking = addTrackingPixel(personalizedHtml, broadcast.id, contact.id)

        try {
          // Create email record first
          const { data: email, error: insertError } = await supabaseAdmin
            .from('emails')
            .insert({
              organization_id: organizationId,
              api_key_id: apiKeyId,
              from_email: broadcast.from_email,
              from_name: broadcast.from_name,
              to_emails: [contact.email],
              subject: personalizedSubject || broadcast.subject,
              html_content: htmlWithTracking,
              text_content: personalizedText,
              status: 'queued',
              metadata: { 
                broadcast_id: broadcast.id,
                contact_id: contact.id,
              },
            })
            .select()
            .single()

          if (insertError) throw insertError

          // Send the email
          const result = await emailService.sendEmail({
            from: broadcast.from_email,
            to: contact.email,
            subject: personalizedSubject || broadcast.subject,
            html: htmlWithTracking || undefined,
            text: personalizedText || undefined,
          }, broadcast.from_name || undefined)

          // Update email status
          await supabaseAdmin
            .from('emails')
            .update({
              status: 'sent',
              provider_message_id: result.messageId,
              sent_at: new Date().toISOString(),
            })
            .eq('id', email.id)

          // Create sent event
          await supabaseAdmin
            .from('email_events')
            .insert({
              email_id: email.id,
              event_type: 'sent',
            })

          // Trigger webhook
          await triggerEmailWebhook(organizationId, 'email.sent', email.id)

          return { success: true, contactId: contact.id }
        } catch (error) {
          console.error(`Failed to send to ${contact.email}:`, error)
          return { success: false, contactId: contact.id, error }
        }
      })
    )

    // Count results
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        sentCount++
      } else {
        failedCount++
      }
    })

    // Update progress
    await supabaseAdmin
      .from('broadcasts')
      .update({ sent_count: sentCount })
      .eq('id', broadcast.id)

    // Delay between batches to avoid rate limits
    if (i + BATCH_SIZE < contacts.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  // Mark as complete
  await supabaseAdmin
    .from('broadcasts')
    .update({
      status: failedCount === contacts.length ? 'failed' : 'sent',
      sent_at: new Date().toISOString(),
      sent_count: sentCount,
    })
    .eq('id', broadcast.id)

  console.log(`Broadcast ${broadcast.id} complete: ${sentCount} sent, ${failedCount} failed`)
}

// Personalize content with contact data
function personalizeContent(content: string | null, contact: Contact): string | null {
  if (!content) return null

  // Generate unsubscribe URL
  const unsubscribeToken = Buffer.from(`${contact.id}:${Date.now()}`).toString('base64url')
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://unosend.com'}/unsubscribe/${unsubscribeToken}`

  return content
    .replace(/\{\{email\}\}/gi, contact.email)
    .replace(/\{\{first_name\}\}/gi, contact.first_name || '')
    .replace(/\{\{last_name\}\}/gi, contact.last_name || '')
    .replace(/\{\{name\}\}/gi, 
      [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email
    )
    .replace(/\{\{unsubscribe_url\}\}/gi, unsubscribeUrl)
    .replace(/\{\{unsubscribe_link\}\}/gi, `<a href="${unsubscribeUrl}">Unsubscribe</a>`)
}

// Add tracking pixel to HTML content
function addTrackingPixel(html: string | null, broadcastId: string, contactId: string): string | null {
  if (!html) return null

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/track/open/${broadcastId}?cid=${contactId}`
  const trackingPixel = `<img src="${trackingUrl}" alt="" width="1" height="1" style="display:none;visibility:hidden;" />`

  // Insert before closing body tag or at the end
  if (html.includes('</body>')) {
    return html.replace('</body>', `${trackingPixel}</body>`)
  }
  
  return html + trackingPixel
}
