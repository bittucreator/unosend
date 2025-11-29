import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateApiKey } from '@/lib/api-utils'
import { encryptApiKey } from '@/lib/crypto'

export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json()
    const { name, expires_in_days } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Generate API key server-side
    const { key, hash, prefix } = generateApiKey()
    
    // Encrypt the key for later retrieval
    const encryptedKey = encryptApiKey(key)

    // Calculate expiration date if provided
    let expiresAt: string | null = null
    if (expires_in_days && typeof expires_in_days === 'number' && expires_in_days > 0) {
      const expDate = new Date()
      expDate.setDate(expDate.getDate() + expires_in_days)
      expiresAt = expDate.toISOString()
    }

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: membership.organization_id,
        name: name.trim(),
        key_hash: hash,
        key_prefix: prefix,
        encrypted_key: encryptedKey,
        expires_at: expiresAt,
      })
      .select('id, name, key_prefix, expires_at, created_at')
      .single()

    if (error) {
      console.error('Failed to create API key:', error)
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    // Return the full key only once
    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: key, // Full key - only shown once
      key_prefix: apiKey.key_prefix,
      expires_at: apiKey.expires_at,
      created_at: apiKey.created_at,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
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

  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, expires_at, created_at')
    .eq('organization_id', membership.organization_id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }

  // Check for expired keys and mark them
  const now = new Date()
  const keysWithStatus = apiKeys.map(key => ({
    ...key,
    is_expired: key.expires_at ? new Date(key.expires_at) < now : false,
  }))

  return NextResponse.json({ api_keys: keysWithStatus })
}
