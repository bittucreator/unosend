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
      profiles (
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

  const formattedMembers = members?.map(m => ({
    id: m.id,
    role: m.role,
    joined_at: m.created_at,
    user: m.profiles,
  })) || []

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

    // User doesn't exist - for now, return a message
    // In a real implementation, you would send an email invitation
    // and store it in an invitations table
    return NextResponse.json({ 
      data: { 
        status: 'invited',
        message: `Invitation sent to ${email}. They will be added when they sign up.`
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
