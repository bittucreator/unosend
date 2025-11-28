import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST - Create a new template (dashboard)
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
    const { name, subject, html_content, text_content } = body

    // Use admin client to bypass RLS
    const { data: template, error } = await supabaseAdmin
      .from('templates')
      .insert({
        organization_id: membership.organization_id,
        name: name || 'Untitled Template',
        subject: subject || '(No subject)',
        html_content: html_content || null,
        text_content: text_content || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: template }, { status: 201 })
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// PUT - Update a template (dashboard)
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  try {
    const body = await request.json()
    const { id, name, subject, html_content, text_content } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    // Use admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from('templates')
      .update({
        name: name || 'Untitled Template',
        subject: subject || '(No subject)',
        html_content: html_content || null,
        text_content: text_content || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', membership.organization_id)

    if (error) {
      console.error('Failed to update template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update template:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
