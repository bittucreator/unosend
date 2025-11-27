import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { triggerEmailWebhook } from '@/lib/webhook-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: linkId } = await params
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    // Get click record
    const { data: click } = await supabaseAdmin
      .from('email_clicks')
      .select('id, email_id, click_count')
      .eq('id', linkId)
      .single()

    if (click) {
      // Update click count
      await supabaseAdmin
        .from('email_clicks')
        .update({ 
          click_count: (click.click_count || 0) + 1,
          last_clicked_at: new Date().toISOString(),
        })
        .eq('id', linkId)

      // Get email for organization_id
      const { data: email } = await supabaseAdmin
        .from('emails')
        .select('organization_id')
        .eq('id', click.email_id)
        .single()

      // Record email event
      await supabaseAdmin
        .from('email_events')
        .insert({
          email_id: click.email_id,
          event_type: 'clicked',
          metadata: {
            link_id: linkId,
            url,
            user_agent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || 'unknown',
          },
        })

      // Trigger webhook
      if (email) {
        await triggerEmailWebhook(email.organization_id, 'email.clicked', click.email_id, {
          link_url: url,
        })
      }
    }
  } catch (error) {
    console.error('Error tracking click:', error)
  }

  // Redirect to the original URL
  return NextResponse.redirect(url)
}
