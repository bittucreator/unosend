import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import dns from 'dns'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)

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
      message: 'Domain is already verified' 
    })
  }

  const dnsRecords = domain.dns_records as Array<{
    type: string
    name: string
    value: string
    status: string
  }>

  // Find the TXT verification record
  const verificationRecord = dnsRecords.find(
    r => r.type === 'TXT' && r.name.startsWith('_unosend.')
  )

  if (!verificationRecord) {
    return apiError('Verification record not found', 500)
  }

  try {
    // Query DNS for TXT records
    const txtRecords = await resolveTxt(verificationRecord.name)
    const flatRecords = txtRecords.flat()

    // Check if our verification value exists
    const isVerified = flatRecords.some(
      record => record.includes(verificationRecord.value.split(' ')[1]) // Check for the key part
    )

    if (isVerified) {
      // Update domain status to verified
      const updatedRecords = dnsRecords.map(r => ({
        ...r,
        status: r.name.startsWith('_unosend.') ? 'verified' : r.status
      }))

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
        message: 'Domain verified successfully',
      })
    } else {
      return apiSuccess({
        verified: false,
        message: 'DNS records not found. Please add the TXT record and wait for propagation.',
      })
    }
  } catch {
    // DNS lookup failed
    return apiSuccess({
      verified: false,
      message: 'DNS lookup failed. Please ensure the TXT record is added correctly.',
    })
  }
}
