import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Get invitation
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select('id, organization_id, email, role, expires_at, accepted_at')
      .eq('token', token)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 })
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    // Check email matches
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json({ 
        error: 'This invitation was sent to a different email address' 
      }, { status: 403 })
    }

    // Check if already a member
    const { data: existingMember } = await supabaseAdmin
      .from('organization_members')
      .select('id')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      // Mark invitation as accepted anyway
      await supabaseAdmin
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      return NextResponse.json({ 
        data: { 
          status: 'already_member',
          message: 'You are already a member of this workspace' 
        }
      })
    }

    // Add user as member
    const { error: addError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
      })

    if (addError) {
      console.error('Failed to add member:', addError)
      return NextResponse.json({ error: 'Failed to join workspace' }, { status: 500 })
    }

    // Mark invitation as accepted
    await supabaseAdmin
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)

    return NextResponse.json({ 
      data: { 
        status: 'accepted',
        message: 'Successfully joined the workspace' 
      }
    })

  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
