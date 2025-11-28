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
  status: 'pending' | 'verified' | 'failed'
}

// Verify a single DNS record
async function verifyDnsRecord(record: DnsRecord): Promise<{ verified: boolean; error?: string }> {
  try {
    if (record.type === 'TXT') {
      const txtRecords = await resolveTxt(record.name)
      const flatRecords = txtRecords.flat()
      
      // Check if any TXT record contains our expected value
      const expectedValue = record.value.includes('v=unosend1') 
        ? record.value.split('k=')[1]?.trim()
        : record.value
      
      const found = flatRecords.some(r => 
        r.includes(expectedValue) || r === record.value
      )
      
      return { verified: found }
    } else if (record.type === 'CNAME') {
      try {
        const cnameRecords = await resolveCname(record.name)
        const found = cnameRecords.some(r => 
          r.toLowerCase() === record.value.toLowerCase() ||
          r.toLowerCase().endsWith(record.value.toLowerCase())
        )
        return { verified: found }
      } catch {
        // CNAME might not exist yet
        return { verified: false, error: 'CNAME record not found' }
      }
    }
    
    return { verified: false, error: 'Unknown record type' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DNS lookup failed'
    return { verified: false, error: message }
  }
}

export async function POST(
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
    .select('id, domain, status, dns_records')
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .single()

  if (fetchError || !domain) {
    return apiError('Domain not found', 404)
  }

  if (domain.status === 'verified') {
    return apiSuccess({ 
      verified: true, 
      message: 'Domain is already verified',
      records: domain.dns_records,
    })
  }

  const dnsRecords = domain.dns_records as DnsRecord[]
  const verificationResults: Array<{ name: string; type: string; verified: boolean; error?: string }> = []
  let allVerified = true
  let primaryVerified = false

  // Verify each DNS record
  for (const record of dnsRecords) {
    const result = await verifyDnsRecord(record)
    verificationResults.push({
      name: record.name,
      type: record.type,
      verified: result.verified,
      error: result.error,
    })
    
    // Track if primary verification TXT record is verified
    if (record.name.startsWith('_unosend.') && record.type === 'TXT') {
      primaryVerified = result.verified
    }
    
    if (!result.verified) {
      allVerified = false
    }
  }

  // Update record statuses
  const updatedRecords = dnsRecords.map(record => {
    const result = verificationResults.find(r => r.name === record.name && r.type === record.type)
    return {
      ...record,
      status: result?.verified ? 'verified' : 'pending',
    }
  })

  // Domain is verified if primary TXT record is verified (other records are optional but recommended)
  if (primaryVerified) {
    await supabaseAdmin
      .from('domains')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        dns_records: updatedRecords,
      })
      .eq('id', id)

    return apiSuccess({
      verified: true,
      message: allVerified 
        ? 'Domain fully verified with all DNS records'
        : 'Domain verified. Some optional records are still pending.',
      records: verificationResults,
    })
  }

  // Update records even if not fully verified
  await supabaseAdmin
    .from('domains')
    .update({ dns_records: updatedRecords })
    .eq('id', id)

  return apiSuccess({
    verified: false,
    message: 'DNS verification pending. Please ensure all records are added correctly.',
    records: verificationResults,
  })
}
