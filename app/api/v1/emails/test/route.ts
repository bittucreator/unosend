import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { emailService } from '@/lib/email-service'

// Send test email
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, id, testEmail } = body

    // Validate test email
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 })
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    let htmlContent: string | null = null
    let subject: string = 'Test Email'
    let fromEmail = 'test@example.com'
    let fromName: string | null = null

    if (type === 'template' && id) {
      // Get template
      const { data: template, error } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .eq('organization_id', membership.organization_id)
        .single()

      if (error || !template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }

      htmlContent = template.html_content
      subject = template.subject || 'Test Email'
    } else if (type === 'broadcast' && id) {
      // Get broadcast
      const { data: broadcast, error } = await supabaseAdmin
        .from('broadcasts')
        .select('*')
        .eq('id', id)
        .eq('organization_id', membership.organization_id)
        .single()

      if (error || !broadcast) {
        return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 })
      }

      htmlContent = broadcast.html_content
      subject = broadcast.subject || 'Test Email'
      fromEmail = broadcast.from_email
      fromName = broadcast.from_name
    } else if (body.html_content) {
      // Direct content
      htmlContent = body.html_content
      subject = body.subject || 'Test Email'
      fromEmail = body.from_email || 'test@example.com'
      fromName = body.from_name || null
    } else {
      return NextResponse.json({ error: 'Template ID, broadcast ID, or content required' }, { status: 400 })
    }

    // Get a verified domain for sending
    const { data: domain } = await supabaseAdmin
      .from('domains')
      .select('domain')
      .eq('organization_id', membership.organization_id)
      .eq('status', 'verified')
      .limit(1)
      .single()

    if (!domain && !fromEmail.includes('@')) {
      return NextResponse.json({ error: 'No verified domain found' }, { status: 400 })
    }

    // Replace variables with test values
    const testVariables = {
      first_name: 'Test',
      last_name: 'User',
      email: testEmail,
      unsubscribe_url: '#',
    }

    let processedHtml = htmlContent || '<p>No content</p>'
    Object.entries(testVariables).forEach(([key, value]) => {
      processedHtml = processedHtml.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'gi'), value)
    })

    // Add test banner
    const testBanner = `
      <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; margin-bottom: 20px; border-radius: 6px; text-align: center;">
        <strong style="color: #92400e;">🧪 TEST EMAIL</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #92400e;">This is a test email. It was not sent to your actual recipients.</p>
      </div>
    `
    processedHtml = testBanner + processedHtml

    // Send test email
    try {
      await emailService.sendEmail({
        to: testEmail,
        from: fromEmail,
        subject: `[TEST] ${subject}`,
        html: processedHtml,
      }, fromName || undefined)
    } catch (err) {
      console.error('Failed to send test email:', err)
      return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${testEmail}` 
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}
