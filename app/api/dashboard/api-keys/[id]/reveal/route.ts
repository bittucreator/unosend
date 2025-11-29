import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { decryptApiKey } from '@/lib/crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  }

  // Get the API key with encrypted data
  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .select('id, name, encrypted_key')
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .is('revoked_at', null)
    .single()

  if (error || !apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 })
  }

  if (!apiKey.encrypted_key) {
    return NextResponse.json({ 
      error: 'This API key was created before the view feature was available. Please create a new key.' 
    }, { status: 400 })
  }

  // Decrypt the key
  const decryptedKey = decryptApiKey(apiKey.encrypted_key)

  if (!decryptedKey) {
    return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 })
  }

  return NextResponse.json({ 
    key: decryptedKey,
    name: apiKey.name,
  })
}
