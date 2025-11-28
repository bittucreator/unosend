import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DomainsList } from '@/components/dashboard/domains-list'
import { AddDomainButton } from '@/components/dashboard/add-domain-button'
import { Globe, Info, CheckCircle } from 'lucide-react'

export default async function DomainsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const { data: domains } = await supabase
    .from('domains')
    .select('id, domain, status, dns_records, verified_at, created_at')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })

  const verifiedCount = domains?.filter(d => d.status === 'verified').length || 0
  const pendingCount = domains?.filter(d => d.status === 'pending').length || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Domains</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Add and verify domains to send emails
          </p>
        </div>
        <AddDomainButton organizationId={membership.organization_id} />
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Total Domains</p>
              <p className="text-2xl font-semibold mt-1">{domains?.length || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-stone-500" />
            </div>
          </div>
        </div>
        <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Verified</p>
              <p className="text-2xl font-semibold mt-1">{verifiedCount}</p>
            </div>
            <Badge variant="secondary" className={`text-[11px] border-0 ${verifiedCount > 0 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
              <CheckCircle className="w-3 h-3 mr-1" />
              {pendingCount} pending
            </Badge>
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Pending verification</AlertTitle>
          <AlertDescription className="text-orange-700">
            You have {pendingCount} domain{pendingCount > 1 ? 's' : ''} pending verification. 
            Add the DNS records and click verify to complete setup.
          </AlertDescription>
        </Alert>
      )}

      {/* Domains Section */}
      <div className="border border-stone-200/60 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Globe className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">All Domains</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {domains?.length || 0} domain{(domains?.length || 0) !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          <DomainsList domains={domains || []} />
        </div>
      </div>

      {/* DNS Setup Guide */}
      <div className="border border-stone-200/60 rounded-xl bg-white">
        <div className="p-4 sm:p-5 border-b border-stone-100">
          <h2 className="font-semibold text-[15px]">DNS Setup Guide</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">How to verify your domain</p>
        </div>
        
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[11px] font-medium shrink-0 text-stone-600">1</div>
            <div>
              <p className="text-[13px] font-medium">Add your domain</p>
              <p className="text-[12px] text-muted-foreground">Click &quot;Add Domain&quot; and enter your domain name</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[11px] font-medium shrink-0 text-stone-600">2</div>
            <div>
              <p className="text-[13px] font-medium">Add DNS records</p>
              <p className="text-[12px] text-muted-foreground">Copy the TXT and CNAME records to your DNS provider</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[11px] font-medium shrink-0 text-stone-600">3</div>
            <div>
              <p className="text-[13px] font-medium">Verify domain</p>
              <p className="text-[12px] text-muted-foreground">Wait for DNS propagation (up to 48 hours) and click verify</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
