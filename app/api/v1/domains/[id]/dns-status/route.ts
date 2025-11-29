import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import dns from 'dns'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)
const resolveCname = promisify(dns.resolveCname)

interface DnsRecord {
  type: string
  name: string
  value: string
  status: string
}

// Check DNS status without updating the domain
async function checkDnsRecord(record: DnsRecord): Promise<{ 
  type: string
  name: string
  expected: string
  found: string | null
  verified: boolean
  error?: string 
}> {
  try {
    if (record.type === 'TXT') {
      try {
        const txtRecords = await resolveTxt(record.name)
        const flatRecords = txtRecords.flat()
        
        // Check if any TXT record contains our expected value
        const expectedValue = record.value.includes('v=unosend1') 
          ? record.value.split('k=')[1]?.trim()
          : record.value
        
        const matchingRecord = flatRecords.find(r => 
          r.includes(expectedValue) || r === record.value
        )
        
        return { 
          type: record.type,
          name: record.name,
          expected: record.value,
          found: matchingRecord || null,
          verified: !!matchingRecord,
        }
      } catch {
        return { 
          type: record.type,
          name: record.name,
          expected: record.value,
          found: null,
          verified: false,
          error: 'TXT record not found',
        }
      }
    } else if (record.type === 'CNAME') {
      try {
        const cnameRecords = await resolveCname(record.name)
        const matchingRecord = cnameRecords.find(r => 
          r.toLowerCase() === record.value.toLowerCase() ||
          r.toLowerCase().endsWith(record.value.toLowerCase())
        )
        
        return { 
          type: record.type,
          name: record.name,
          expected: record.value,
          found: matchingRecord || cnameRecords[0] || null,
          verified: !!matchingRecord,
        }
      } catch {
        return { 
          type: record.type,
          name: record.name,
          expected: record.value,
          found: null,
          verified: false,
          error: 'CNAME record not found',
        }
      }
    }
    
    return { 
      type: record.type,
      name: record.name,
      expected: record.value,
      found: null,
      verified: false,
      error: 'Unknown record type',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DNS lookup failed'
    return { 
      type: record.type,
      name: record.name,
      expected: record.value,
      found: null,
      verified: false,
      error: message,
    }
  }
}

// GET - Check DNS status for a domain
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { id } = await params

  // Get domain
  const { data: domain, error: fetchError } = await supabaseAdmin
    .from('domains')
    .select('id, domain, status, dns_records, verified_at')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (fetchError || !domain) {
    return apiError('Domain not found', 404)
  }

  const dnsRecords = domain.dns_records as DnsRecord[]
  const checkResults = await Promise.all(dnsRecords.map(checkDnsRecord))

  const allVerified = checkResults.every(r => r.verified)
  const primaryVerified = checkResults.find(r => r.name.startsWith('_unosend.') && r.type === 'TXT')?.verified || false

  return apiSuccess({
    domain: domain.domain,
    status: domain.status,
    verified_at: domain.verified_at,
    dns_status: {
      all_records_verified: allVerified,
      primary_record_verified: primaryVerified,
      ready_to_send: domain.status === 'verified' || primaryVerified,
    },
    records: checkResults,
    checked_at: new Date().toISOString(),
  })
}
