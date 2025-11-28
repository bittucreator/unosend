import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get a single workspace
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user has access to this workspace
  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', id)
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const { data: organization, error } = await supabase
    .from('organizations')
    .select('id, name, slug, icon_url, owner_id, created_at')
    .eq('id', id)
    .single()

  if (error || !organization) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  return NextResponse.json({ 
    data: {
      ...organization,
      role: membership.role,
    }
  })
}

// PATCH - Update a workspace
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user is owner or admin
  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', id)
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  if (membership.role === 'member') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, icon_url } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Invalid workspace name' }, { status: 400 })
      }
      if (name.length > 100) {
        return NextResponse.json({ error: 'Workspace name must be 100 characters or less' }, { status: 400 })
      }
      updates.name = name.trim()
    }

    if (icon_url !== undefined) {
      updates.icon_url = icon_url
    }

    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select('id, name, slug, icon_url, owner_id, created_at, updated_at')
      .single()

    if (error) {
      console.error('Failed to update workspace:', error)
      return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 })
    }

    return NextResponse.json({ data: organization })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE - Delete a workspace
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only owner can delete
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (orgError || !organization) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  if (organization.owner_id !== user.id) {
    return NextResponse.json({ error: 'Only the owner can delete this workspace' }, { status: 403 })
  }

  // Check if user has other workspaces
  const { count } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count && count <= 1) {
    return NextResponse.json({ 
      error: 'Cannot delete your only workspace. Create another workspace first.' 
    }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('organizations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete workspace:', error)
    return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
