import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - List all members of a workspace
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

  // Fetch all members
  const { data: members, error } = await supabaseAdmin
    .from('organization_members')
    .select(`
      id,
      role,
      created_at,
      user_id,
      profiles:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', workspaceId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }

  const formattedMembers = members?.map(m => {
    // Handle both array and object responses from Supabase join
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      id: m.id,
      role: m.role,
      joined_at: m.created_at,
      user: profile ? {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      } : {
        id: m.user_id,
        email: 'Unknown',
        full_name: null,
        avatar_url: null,
      },
    }
  }) || []

  return NextResponse.json({ data: formattedMembers })
}

// POST - Invite a new member
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, workspaceId, role = 'member' } = body

    if (!email || !workspaceId) {
      return NextResponse.json({ error: 'Email and workspace ID required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check user has permission to invite
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role === 'member') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check if user exists
    const { data: invitedProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (invitedProfile) {
      // User exists, check if already a member
      const { data: existingMember } = await supabaseAdmin
        .from('organization_members')
        .select('id')
        .eq('organization_id', workspaceId)
        .eq('user_id', invitedProfile.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
      }

      // Add user directly to the workspace
      const { error: addError } = await supabaseAdmin
        .from('organization_members')
        .insert({
          organization_id: workspaceId,
          user_id: invitedProfile.id,
          role: role,
        })

      if (addError) {
        console.error('Failed to add member:', addError)
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
      }

      return NextResponse.json({ 
        data: { 
          status: 'added',
          message: `${email} has been added to the workspace`
        }
      }, { status: 201 })
    }

    // User doesn't exist - create an invitation
    // Generate a secure token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID()

    // Check for existing pending invitation
    const { data: existingInvite } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('organization_id', workspaceId)
      .eq('email', email.toLowerCase())
      .is('accepted_at', null)
      .single()

    if (existingInvite) {
      return NextResponse.json({ 
        error: 'An invitation has already been sent to this email' 
      }, { status: 400 })
    }

    // Get organization name for email
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', workspaceId)
      .single()

    // Get inviter's name
    const { data: inviterProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Create invitation record
    const { error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({
        organization_id: workspaceId,
        email: email.toLowerCase(),
        role: role,
        token: token,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })

    if (inviteError) {
      console.error('Failed to create invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unosend.com'
    const inviteUrl = `${appUrl}/invite/${token}`
    const inviterName = inviterProfile?.full_name || inviterProfile?.email || 'Someone'
    const orgName = org?.name || 'a workspace'

    try {
      // Import email service dynamically to avoid circular deps
      const { emailService } = await import('@/lib/email-service')
      
      await emailService.sendEmail({
        from: process.env.SYSTEM_EMAIL_FROM || 'noreply@unosend.com',
        to: email,
        subject: `${inviterName} invited you to join ${orgName} on Unosend`,
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
            
            <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">You're invited to join ${orgName}</h1>
            
            <p style="color: #57534e; margin-bottom: 24px;">
              <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Unosend as a <strong>${role}</strong>.
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
        text: `${inviterName} has invited you to join ${orgName} on Unosend as a ${role}.\n\nAccept the invitation: ${inviteUrl}\n\nThis invitation will expire in 7 days.`,
      })
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the request - invitation is created, email just didn't send
    }

    return NextResponse.json({ 
      data: { 
        status: 'invited',
        message: `Invitation sent to ${email}. They will be added when they accept.`
      }
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE - Remove a member
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('memberId')
  const workspaceId = searchParams.get('workspaceId')

  if (!memberId || !workspaceId) {
    return NextResponse.json({ error: 'Member ID and workspace ID required' }, { status: 400 })
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

  // Get the member being removed
  const { data: targetMember } = await supabaseAdmin
    .from('organization_members')
    .select('user_id, role')
    .eq('id', memberId)
    .eq('organization_id', workspaceId)
    .single()

  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Can't remove owner
  if (targetMember.role === 'owner') {
    return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 400 })
  }

  // Admins can only remove members, not other admins
  if (membership.role === 'admin' && targetMember.role === 'admin') {
    return NextResponse.json({ error: 'Admins cannot remove other admins' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('organization_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    console.error('Failed to remove member:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// PATCH - Update member role
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { memberId, workspaceId, role } = body

    if (!memberId || !workspaceId || !role) {
      return NextResponse.json({ error: 'Member ID, workspace ID, and role required' }, { status: 400 })
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be admin or member' }, { status: 400 })
    }

    // Check user is owner (only owner can change roles)
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json({ error: 'Only workspace owner can change roles' }, { status: 403 })
    }

    // Get the target member
    const { data: targetMember } = await supabaseAdmin
      .from('organization_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('organization_id', workspaceId)
      .single()

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Can't change owner's role
    if (targetMember.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change the owner\'s role' }, { status: 400 })
    }

    // Can't change own role
    if (targetMember.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    // Update the role
    const { error } = await supabaseAdmin
      .from('organization_members')
      .update({ role })
      .eq('id', memberId)

    if (error) {
      console.error('Failed to update member role:', error)
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { role } })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
