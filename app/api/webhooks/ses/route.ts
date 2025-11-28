import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// AWS SES SNS Types
interface SESBouncedRecipient {
  emailAddress: string
  action?: string
  status?: string
  diagnosticCode?: string
}

interface SESBounce {
  bounceType: 'Permanent' | 'Transient' | 'Undetermined'
  bounceSubType: string
  bouncedRecipients: SESBouncedRecipient[]
  timestamp: string
  feedbackId: string
}

interface SESComplainedRecipient {
  emailAddress: string
}

interface SESComplaint {
  complainedRecipients: SESComplainedRecipient[]
  complaintFeedbackType?: string
  timestamp: string
  feedbackId: string
}

interface SESDelivery {
  timestamp: string
  processingTimeMillis: number
  recipients: string[]
  smtpResponse: string
  reportingMTA: string
}

interface SESMail {
  timestamp: string
  source: string
  sourceArn?: string
  sendingAccountId?: string
  messageId: string
  destination: string[]
  headersTruncated?: boolean
  headers?: Array<{ name: string; value: string }>
  commonHeaders?: {
    from?: string[]
    to?: string[]
    subject?: string
  }
}

interface SESBounceMessage {
  notificationType?: 'Bounce'
  eventType?: 'Bounce'
  bounce: SESBounce
  mail: SESMail
}

interface SESComplaintMessage {
  notificationType?: 'Complaint'
  eventType?: 'Complaint'
  complaint: SESComplaint
  mail: SESMail
}

interface SESDeliveryMessage {
  notificationType?: 'Delivery'
  eventType?: 'Delivery'
  delivery: SESDelivery
  mail: SESMail
}

// AWS SES SNS Webhook Handler for bounces and complaints
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    let notification

    try {
      notification = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Handle SNS subscription confirmation
    if (notification.Type === 'SubscriptionConfirmation') {
      // Auto-confirm by visiting the SubscribeURL
      if (notification.SubscribeURL) {
        await fetch(notification.SubscribeURL)
      }
      return NextResponse.json({ message: 'Subscription confirmed' })
    }

    // Handle notification
    if (notification.Type === 'Notification') {
      let message
      try {
        message = JSON.parse(notification.Message)
      } catch {
        message = notification.Message
      }

      const notificationType = message.notificationType || message.eventType

      if (notificationType === 'Bounce') {
        await handleBounce(message)
      } else if (notificationType === 'Complaint') {
        await handleComplaint(message)
      } else if (notificationType === 'Delivery') {
        await handleDelivery(message)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('SES webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleBounce(message: SESBounceMessage) {
  const bounce = message.bounce
  const mail = message.mail

  if (!bounce || !mail) return

  const bounceType = bounce.bounceType // Permanent, Transient
  const bounceSubType = bounce.bounceSubType // General, NoEmail, Suppressed, etc.
  const messageId = mail.messageId
  const timestamp = bounce.timestamp

  // Get bounced recipients
  const bouncedRecipients = bounce.bouncedRecipients || []

  for (const recipient of bouncedRecipients) {
    const email = recipient.emailAddress

    // Find the email record by message_id
    const { data: emailRecord } = await supabaseAdmin
      .from('emails')
      .select('id, organization_id')
      .eq('message_id', messageId)
      .single()

    if (emailRecord) {
      // Update email status
      await supabaseAdmin
        .from('emails')
        .update({
          status: 'bounced',
          bounce_type: bounceType,
          bounce_subtype: bounceSubType,
          bounced_at: timestamp,
        })
        .eq('id', emailRecord.id)

      // Create email event
      await supabaseAdmin
        .from('email_events')
        .insert({
          email_id: emailRecord.id,
          event_type: 'bounce',
          event_data: {
            bounce_type: bounceType,
            bounce_subtype: bounceSubType,
            diagnostic_code: recipient.diagnosticCode,
          },
        })
    }

    // For hard bounces, unsubscribe the contact
    if (bounceType === 'Permanent') {
      await supabaseAdmin
        .from('contacts')
        .update({
          subscribed: false,
          unsubscribed_at: new Date().toISOString(),
          unsubscribe_reason: `Hard bounce: ${bounceSubType}`,
        })
        .eq('email', email.toLowerCase())
    }

    // Update usage stats
    if (emailRecord) {
      await supabaseAdmin.rpc('increment_usage_stat', {
        p_organization_id: emailRecord.organization_id,
        p_stat: 'emails_bounced',
        p_amount: 1,
      })
    }
  }

  console.log(`Processed bounce: ${bounceType}/${bounceSubType} for ${bouncedRecipients.length} recipients`)
}

async function handleComplaint(message: SESComplaintMessage) {
  const complaint = message.complaint
  const mail = message.mail

  if (!complaint || !mail) return

  const messageId = mail.messageId
  const complaintFeedbackType = complaint.complaintFeedbackType
  const timestamp = complaint.timestamp

  const complainedRecipients = complaint.complainedRecipients || []

  for (const recipient of complainedRecipients) {
    const email = recipient.emailAddress

    // Find the email record
    const { data: emailRecord } = await supabaseAdmin
      .from('emails')
      .select('id, organization_id')
      .eq('message_id', messageId)
      .single()

    if (emailRecord) {
      // Update email status
      await supabaseAdmin
        .from('emails')
        .update({
          status: 'complained',
          complained_at: timestamp,
        })
        .eq('id', emailRecord.id)

      // Create email event
      await supabaseAdmin
        .from('email_events')
        .insert({
          email_id: emailRecord.id,
          event_type: 'complaint',
          event_data: {
            feedback_type: complaintFeedbackType,
          },
        })
    }

    // Always unsubscribe on complaint
    await supabaseAdmin
      .from('contacts')
      .update({
        subscribed: false,
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_reason: `Complaint: ${complaintFeedbackType || 'abuse'}`,
      })
      .eq('email', email.toLowerCase())
  }

  console.log(`Processed complaint for ${complainedRecipients.length} recipients`)
}

async function handleDelivery(message: SESDeliveryMessage) {
  const delivery = message.delivery
  const mail = message.mail

  if (!delivery || !mail) return

  const messageId = mail.messageId
  const timestamp = delivery.timestamp

  // Update email status
  const { data: emailRecord } = await supabaseAdmin
    .from('emails')
    .update({
      status: 'delivered',
      delivered_at: timestamp,
    })
    .eq('message_id', messageId)
    .select('id, organization_id')
    .single()

  if (emailRecord) {
    // Create delivery event
    await supabaseAdmin
      .from('email_events')
      .insert({
        email_id: emailRecord.id,
        event_type: 'delivered',
      })

    // Update usage stats
    await supabaseAdmin.rpc('increment_usage_stat', {
      p_organization_id: emailRecord.organization_id,
      p_stat: 'emails_delivered',
      p_amount: 1,
    })
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'SES webhook endpoint ready' 
  })
}
