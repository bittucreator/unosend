import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your sending domains
          </p>
        </div>
        <AddDomainButton organizationId={membership.organization_id} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Domains</p>
                <p className="text-2xl font-bold">{domains?.length || 0}</p>
              </div>
              <Globe className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{verifiedCount}</p>
              </div>
              <Badge variant={verifiedCount > 0 ? 'default' : 'secondary'}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {pendingCount} pending
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingCount > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Pending verification</AlertTitle>
          <AlertDescription>
            You have {pendingCount} domain{pendingCount > 1 ? 's' : ''} pending verification. 
            Add the DNS records and click verify to complete setup.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Your Domains</CardTitle>
          <CardDescription>
            Add and verify domains to send emails from custom addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DomainsList domains={domains || []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">DNS Setup Guide</CardTitle>
          <CardDescription>
            How to verify your domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">1</div>
              <div>
                <p className="text-sm font-medium">Add your domain</p>
                <p className="text-xs text-muted-foreground">Click &quot;Add Domain&quot; and enter your domain name</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">2</div>
              <div>
                <p className="text-sm font-medium">Add DNS records</p>
                <p className="text-xs text-muted-foreground">Copy the TXT and CNAME records to your DNS provider</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">3</div>
              <div>
                <p className="text-sm font-medium">Verify domain</p>
                <p className="text-xs text-muted-foreground">Wait for DNS propagation (up to 48 hours) and click verify</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
