import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { createDomainSchema } from '@/lib/validations'
import { generateDnsRecords } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  try {
    const body = await request.json()
    
    const validationResult = createDomainSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { domain } = validationResult.data

    // Check if domain already exists
    const { data: existing } = await supabaseAdmin
      .from('domains')
      .select('id')
      .eq('organization_id', context.organizationId)
      .eq('domain', domain)
      .single()

    if (existing) {
      return apiError('Domain already exists', 409)
    }

    // Generate DNS records for verification
    const dnsRecords = generateDnsRecords(domain)

    const { data: newDomain, error } = await supabaseAdmin
      .from('domains')
      .insert({
        organization_id: context.organizationId,
        domain,
        status: 'pending',
        dns_records: dnsRecords,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create domain:', error)
      return apiError('Failed to create domain', 500)
    }

    return apiSuccess({
      id: newDomain.id,
      domain: newDomain.domain,
      status: newDomain.status,
      dns_records: dnsRecords,
      created_at: newDomain.created_at,
    }, 201)
  } catch {
    return apiError('Invalid request body', 400)
  }
}

export async function GET(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { data: domains, error } = await supabaseAdmin
    .from('domains')
    .select('id, domain, status, dns_records, verified_at, created_at')
    .eq('organization_id', context.organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    return apiError('Failed to fetch domains', 500)
  }

  return apiSuccess({ data: domains })
}
