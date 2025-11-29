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

// Log API request to database
export async function logApiRequest({
  organizationId,
  apiKeyId,
  method,
  endpoint,
  path,
  statusCode,
  userAgent,
  ipAddress,
  requestBody,
  responseBody,
  durationMs,
}: {
  organizationId: string
  apiKeyId?: string
  method: string
  endpoint: string
  path: string
  statusCode: number
  userAgent?: string | null
  ipAddress?: string | null
  requestBody?: unknown
  responseBody?: unknown
  durationMs?: number
}) {
  try {
    // Sanitize sensitive data from request/response bodies
    const sanitizedRequest = requestBody ? sanitizeBody(requestBody) : null
    const sanitizedResponse = responseBody ? sanitizeBody(responseBody) : null
    
    await supabaseAdmin.from('api_logs').insert({
      organization_id: organizationId,
      api_key_id: apiKeyId || null,
      method,
      endpoint,
      path,
      status_code: statusCode,
      user_agent: userAgent || null,
      ip_address: ipAddress || null,
      request_body: sanitizedRequest,
      response_body: sanitizedResponse,
      duration_ms: durationMs || null,
    })
  } catch (error) {
    console.error('[API Log] Failed to log request:', error)
  }
}

// Sanitize sensitive fields from bodies
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body
  
  const sensitiveKeys = ['api_key', 'apiKey', 'password', 'secret', 'token', 'authorization']
  const sanitized = { ...body as Record<string, unknown> }
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]'
    }
  }
  
  return sanitized
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

// Plan limits configuration
const PLAN_EMAIL_LIMITS: Record<string, number> = {
  free: 5000,
  pro: 50000,
  scale: 200000,
  enterprise: -1, // Unlimited
}

export interface UsageLimitResult {
  allowed: boolean
  current: number
  limit: number
  plan: string
  remaining: number
}

export async function checkUsageLimit(organizationId: string): Promise<UsageLimitResult> {
  // Get subscription/plan info
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status')
    .eq('organization_id', organizationId)
    .single()

  const plan = subscription?.plan || 'free'
  const limit = PLAN_EMAIL_LIMITS[plan] || PLAN_EMAIL_LIMITS.free
  
  // Check if billing is not active (except for free plan)
  if (plan !== 'free' && subscription?.status !== 'active') {
    return {
      allowed: false,
      current: 0,
      limit: PLAN_EMAIL_LIMITS.free,
      plan: 'free',
      remaining: 0,
    }
  }

  // Enterprise has unlimited emails
  if (limit === -1) {
    return {
      allowed: true,
      current: 0,
      limit: -1,
      plan,
      remaining: -1,
    }
  }

  // Get current month's usage
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // First try usage table
  const { data: usageRecord } = await supabaseAdmin
    .from('usage')
    .select('emails_sent')
    .eq('organization_id', organizationId)
    .gte('period_start', startOfMonth.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let currentUsage = usageRecord?.emails_sent || 0

  // If no usage record, count from emails table
  if (!usageRecord) {
    const { count } = await supabaseAdmin
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', startOfMonth.toISOString())

    currentUsage = count || 0
  }

  const remaining = Math.max(0, limit - currentUsage)
  
  return {
    allowed: currentUsage < limit,
    current: currentUsage,
    limit,
    plan,
    remaining,
  }
}
