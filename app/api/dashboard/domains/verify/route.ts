import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
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

// POST - Verify a domain (dashboard)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { domain_id } = body

    if (!domain_id) {
      return NextResponse.json({ error: 'Domain ID required' }, { status: 400 })
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get domain
    const { data: domain, error: fetchError } = await supabaseAdmin
      .from('domains')
      .select('id, domain, status, dns_records')
      .eq('id', domain_id)
      .eq('organization_id', membership.organization_id)
      .single()

    if (fetchError || !domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    if (domain.status === 'verified') {
      return NextResponse.json({ 
        verified: true, 
        message: 'Domain is already verified',
        records: domain.dns_records,
      })
    }

    const dnsRecords = domain.dns_records as DnsRecord[]
    const verificationResults: Array<{ name: string; type: string; verified: boolean; error?: string }> = []
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
    }

    // Update record statuses
    const updatedRecords = dnsRecords.map(record => {
      const result = verificationResults.find(r => r.name === record.name && r.type === record.type)
      return {
        ...record,
        status: result?.verified ? 'verified' : 'pending',
      }
    })

    // Domain is verified if primary TXT record is verified
    if (primaryVerified) {
      await supabaseAdmin
        .from('domains')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          dns_records: updatedRecords,
        })
        .eq('id', domain_id)

      return NextResponse.json({
        verified: true,
        message: 'Domain verified successfully',
        records: verificationResults,
      })
    }

    // Update records even if not fully verified
    await supabaseAdmin
      .from('domains')
      .update({ dns_records: updatedRecords })
      .eq('id', domain_id)

    return NextResponse.json({
      verified: false,
      message: 'DNS verification pending. Please ensure all records are added correctly.',
      records: verificationResults,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
