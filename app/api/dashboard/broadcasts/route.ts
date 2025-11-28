import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST - Create a new broadcast (dashboard)
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
    const { 
      name, 
      subject, 
      from_email, 
      from_name, 
      reply_to,
      audience_id, 
      html_content, 
      text_content,
      scheduled_at,
      total_recipients,
    } = body

    // Use admin client to bypass RLS
    const { data: broadcast, error } = await supabaseAdmin
      .from('broadcasts')
      .insert({
        organization_id: membership.organization_id,
        name: name || 'Untitled Broadcast',
        subject: subject || '(No subject)',
        from_email: from_email || 'noreply@example.com',
        from_name: from_name || null,
        reply_to: reply_to || null,
        audience_id: audience_id || null,
        html_content: html_content || null,
        text_content: text_content || null,
        status: 'draft',
        scheduled_at: scheduled_at || null,
        total_recipients: total_recipients || 0,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create broadcast:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: broadcast }, { status: 201 })
  } catch (error) {
    console.error('Failed to create broadcast:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// PUT - Update a broadcast (dashboard)
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
    const { 
      id,
      name, 
      subject, 
      from_email, 
      from_name, 
      reply_to,
      audience_id, 
      html_content, 
      text_content,
      scheduled_at,
      total_recipients,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Broadcast ID required' }, { status: 400 })
    }

    // Use admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from('broadcasts')
      .update({
        name: name || 'Untitled Broadcast',
        subject: subject || '(No subject)',
        from_email: from_email || 'noreply@example.com',
        from_name: from_name || null,
        reply_to: reply_to || null,
        audience_id: audience_id || null,
        html_content: html_content || null,
        text_content: text_content || null,
        scheduled_at: scheduled_at || null,
        total_recipients: total_recipients || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', membership.organization_id)

    if (error) {
      console.error('Failed to update broadcast:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update broadcast:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
