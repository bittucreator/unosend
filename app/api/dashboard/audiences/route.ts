import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST - Create a new audience (dashboard)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Use admin client to bypass RLS
    const { data: audience, error } = await supabaseAdmin
      .from('audiences')
      .insert({
        organization_id: membership.organization_id,
        name,
        description: description || null,
      })
      .select('id, name')
      .single()

    if (error) {
      console.error('Failed to create audience:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: audience }, { status: 201 })
  } catch (error) {
    console.error('Failed to create audience:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
