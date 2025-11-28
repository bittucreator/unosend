import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - List all workspaces for the authenticated user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organizations (
        id,
        name,
        slug,
        icon_url,
        owner_id,
        created_at
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to fetch workspaces:', error)
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 })
  }

  const workspaces = memberships?.map(m => ({
    ...m.organizations,
    role: m.role,
  })) || []

  return NextResponse.json({ data: workspaces })
}

// POST - Create a new workspace
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, icon_url } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Workspace name must be 100 characters or less' }, { status: 400 })
    }

    // Generate a slug from the name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // Add a random suffix to ensure uniqueness
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`

    // Create the organization
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: name.trim(),
        slug,
        owner_id: user.id,
        icon_url: icon_url || null,
      })
      .select('id, name, slug, icon_url, owner_id, created_at')
      .single()

    if (orgError) {
      console.error('Failed to create workspace:', orgError)
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
    }

    // Add the user as owner member
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      // Rollback organization creation
      await supabaseAdmin.from('organizations').delete().eq('id', organization.id)
      console.error('Failed to add owner as member:', memberError)
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: {
        ...organization,
        role: 'owner',
      }
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
