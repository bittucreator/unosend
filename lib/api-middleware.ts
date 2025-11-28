import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { hashApiKey } from '@/lib/api-utils'

export interface ApiContext {
  organizationId: string
  apiKeyId: string
}

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetAt: record.resetAt }
}

export async function validateApiKey(request: NextRequest): Promise<ApiContext | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[API] Missing or invalid auth header')
    return null
  }

  const apiKey = authHeader.replace('Bearer ', '')
  
  if (!apiKey.startsWith('un_')) {
    console.log('[API] API key does not start with un_')
    return null
  }

  const keyHash = hashApiKey(apiKey)
  console.log('[API] Looking for key hash:', keyHash.substring(0, 16) + '...')

  const { data: apiKeyRecord, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, organization_id, revoked_at, expires_at')
    .eq('key_hash', keyHash)
    .single()

  if (error) {
    console.log('[API] Database error:', error.message)
    return null
  }
  
  if (!apiKeyRecord) {
    console.log('[API] No API key record found')
    return null
  }

  // Check if key is revoked
  if (apiKeyRecord.revoked_at) {
    console.log('[API] Key is revoked')
    return null
  }

  // Check if key is expired
  if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
    console.log('[API] Key is expired')
    return null
  }

  // Update last used timestamp
  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKeyRecord.id)

  console.log('[API] Key validated successfully for org:', apiKeyRecord.organization_id)
  
  return {
    organizationId: apiKeyRecord.organization_id,
    apiKeyId: apiKeyRecord.id,
  }
}

export function apiError(message: string, status: number = 400) {
  return NextResponse.json(
    { error: { message, code: status } },
    { status }
  )
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function withRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetAt: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetAt / 1000).toString())
  return response
}
