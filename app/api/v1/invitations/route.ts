import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - List pending invitations for a workspace
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get('workspaceId')

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
  }

  // Check user has access
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  // Fetch pending invitations
  const { data: invitations, error } = await supabaseAdmin
    .from('invitations')
    .select(`
      id,
      email,
      role,
      created_at,
      expires_at,
      invited_by
    `)
    .eq('organization_id', workspaceId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch invitations:', error)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }

  // Get inviter profiles separately
  const inviterIds = [...new Set(invitations?.map(i => i.invited_by).filter(Boolean))]
  let inviterProfiles: Record<string, { full_name: string | null; email: string }> = {}
  
  if (inviterIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', inviterIds)
    
    if (profiles) {
      inviterProfiles = profiles.reduce((acc, p) => {
        acc[p.id] = { full_name: p.full_name, email: p.email }
        return acc
      }, {} as Record<string, { full_name: string | null; email: string }>)
    }
  }

  const formattedInvitations = invitations?.map(inv => ({
    ...inv,
    profiles: inv.invited_by ? inviterProfiles[inv.invited_by] || null : null,
  })) || []

  return NextResponse.json({ data: formattedInvitations })
}

// DELETE - Cancel/revoke an invitation
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const invitationId = searchParams.get('invitationId')
  const workspaceId = searchParams.get('workspaceId')

  if (!invitationId || !workspaceId) {
    return NextResponse.json({ error: 'Invitation ID and workspace ID required' }, { status: 400 })
  }

  // Check user has permission
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role === 'member') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .eq('organization_id', workspaceId)

  if (error) {
    console.error('Failed to delete invitation:', error)
    return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// POST - Resend an invitation
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { invitationId, workspaceId } = body

    if (!invitationId || !workspaceId) {
      return NextResponse.json({ error: 'Invitation ID and workspace ID required' }, { status: 400 })
    }

    // Check user has permission
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role === 'member') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get the invitation
    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('id, email, role, token')
      .eq('id', invitationId)
      .eq('organization_id', workspaceId)
      .is('accepted_at', null)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Generate new token and extend expiry
    const newToken = crypto.randomUUID() + '-' + crypto.randomUUID()
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({
        token: newToken,
        expires_at: newExpiry,
        invited_by: user.id,
      })
      .eq('id', invitationId)

    if (updateError) {
      console.error('Failed to update invitation:', updateError)
      return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 })
    }

    // Get organization and inviter info for email
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', workspaceId)
      .single()

    const { data: inviterProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unosend.com'
    const inviteUrl = `${appUrl}/invite/${newToken}`
    const inviterName = inviterProfile?.full_name || inviterProfile?.email || 'Someone'
    const orgName = org?.name || 'a workspace'

    try {
      const { emailService } = await import('@/lib/email-service')
      
      await emailService.sendEmail({
        from: process.env.SYSTEM_EMAIL_FROM || 'noreply@unosend.com',
        to: invitation.email,
        subject: `Reminder: ${inviterName} invited you to join ${orgName} on Unosend`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1c1917; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="${appUrl}/Logo.svg" alt="Unosend" style="height: 32px; width: auto;" />
            </div>
            
            <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Reminder: You're invited to join ${orgName}</h1>
            
            <p style="color: #57534e; margin-bottom: 24px;">
              <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Unosend as a <strong>${invitation.role}</strong>.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background-color: #1c1917; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                Accept Invitation
              </a>
            </div>
            
            <p style="color: #78716c; font-size: 14px;">
              Or copy and paste this link into your browser:<br/>
              <a href="${inviteUrl}" style="color: #1c1917;">${inviteUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 32px 0;" />
            
            <p style="color: #a8a29e; font-size: 12px;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </body>
          </html>
        `,
        text: `Reminder: ${inviterName} has invited you to join ${orgName} on Unosend as a ${invitation.role}.\n\nAccept the invitation: ${inviteUrl}\n\nThis invitation will expire in 7 days.`,
      })
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      data: { message: `Invitation resent to ${invitation.email}` } 
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
