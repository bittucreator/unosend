import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST - Upload a workspace icon
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const workspaceId = formData.get('workspaceId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use PNG, JPG, or WebP.' }, { status: 400 })
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 })
    }

    // If workspaceId provided, verify user has access
    if (workspaceId) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', workspaceId)
        .eq('user_id', user.id)
        .single()

      if (!membership || membership.role === 'member') {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
      }
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png'
    const fileName = `workspace-icons/${workspaceId || user.id}/${Date.now()}.${ext}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error('Failed to upload file:', error)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('assets')
      .getPublicUrl(data.path)

    // If workspaceId provided, update the organization
    if (workspaceId) {
      await supabaseAdmin
        .from('organizations')
        .update({ icon_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', workspaceId)
    }

    return NextResponse.json({ 
      data: {
        url: publicUrl,
        path: data.path,
      }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 })
  }
}
