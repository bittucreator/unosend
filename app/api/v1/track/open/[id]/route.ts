import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { triggerEmailWebhook } from '@/lib/webhook-service'

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: emailId } = await params

  try {
    // Get email and check it exists
    const { data: email } = await supabaseAdmin
      .from('emails')
      .select('id, organization_id, opened_at')
      .eq('id', emailId)
      .single()

    if (email) {
      // Only record first open
      if (!email.opened_at) {
        await supabaseAdmin
          .from('emails')
          .update({ opened_at: new Date().toISOString() })
          .eq('id', emailId)
      }

      // Record email event
      await supabaseAdmin
        .from('email_events')
        .insert({
          email_id: emailId,
          event_type: 'opened',
          metadata: {
            user_agent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || 'unknown',
          },
        })

      // Trigger webhook
      await triggerEmailWebhook(email.organization_id, 'email.opened', emailId)
    }
  } catch (error) {
    console.error('Error tracking email open:', error)
  }

  // Always return the tracking pixel
  return new NextResponse(TRACKING_PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
