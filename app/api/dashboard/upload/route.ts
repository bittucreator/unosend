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
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'avatar' or 'workspace-logo'
    const organizationId = formData.get('organizationId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 2MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, GIF, or WebP' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (type === 'avatar') {
      // Upload user avatar
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(filePath, buffer, { 
          contentType: file.type,
          upsert: true 
        })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      return NextResponse.json({ data: { url: publicUrl } })

    } else if (type === 'workspace-logo' && organizationId) {
      // Verify user is admin/owner of the organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single()

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }

      // Upload workspace logo
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `${organizationId}/${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('workspace-logos')
        .upload(filePath, buffer, { 
          contentType: file.type,
          upsert: true 
        })

      if (uploadError) {
        console.error('Logo upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('workspace-logos')
        .getPublicUrl(filePath)

      // Update organization
      const { error: updateError } = await supabaseAdmin
        .from('organizations')
        .update({ icon_url: publicUrl })
        .eq('id', organizationId)

      if (updateError) {
        console.error('Organization update error:', updateError)
        return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
      }

      return NextResponse.json({ data: { url: publicUrl } })

    } else {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
