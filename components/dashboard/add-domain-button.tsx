'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2, Crown } from 'lucide-react'

interface AddDomainButtonProps {
  organizationId: string
}

// Domain limits per plan
const DOMAIN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 10,
  scale: -1, // unlimited
  enterprise: -1, // unlimited
}

export function AddDomainButton({ organizationId }: AddDomainButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [domain, setDomain] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [domainCount, setDomainCount] = useState<number>(0)
  const [isCheckingLimits, setIsCheckingLimits] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  // Check limits when dialog opens
  useEffect(() => {
    if (open) {
      checkLimits()
    }
  }, [open])

  const checkLimits = async () => {
    setIsCheckingLimits(true)
    const supabase = createClient()

    // Get organization plan
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', organizationId)
      .single()

    const plan = org?.plan || 'free'
    setCurrentPlan(plan)

    // Get current domain count
    const { count } = await supabase
      .from('domains')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    const currentCount = count || 0
    setDomainCount(currentCount)

    // Check if limit reached
    const limit = DOMAIN_LIMITS[plan] || 1
    setLimitReached(limit !== -1 && currentCount >= limit)
    
    setIsCheckingLimits(false)
  }

  const handleAdd = async () => {
    if (!domain.trim()) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    // Generate DNS records
    const verificationCode = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const dnsRecords = [
      {
        type: 'TXT',
        name: `_unosend.${domain}`,
        value: `v=unosend1 k=${verificationCode}`,
        status: 'pending'
      },
      {
        type: 'CNAME',
        name: `mail.${domain}`,
        value: 'mail.unosend.co',
        status: 'pending'
      },
      {
        type: 'TXT',
        name: domain,
        value: 'v=spf1 include:spf.unosend.co ~all',
        status: 'pending'
      }
    ]

    const { error: insertError } = await supabase
      .from('domains')
      .insert({
        organization_id: organizationId,
        domain: domain.trim().toLowerCase(),
        status: 'pending',
        dns_records: dnsRecords,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('This domain already exists')
      } else {
        setError('Failed to add domain')
      }
      setIsLoading(false)
      return
    }

    setOpen(false)
    setDomain('')
    setIsLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-[13px]">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Enter your domain name. You&apos;ll need to add DNS records to verify ownership.
          </DialogDescription>
        </DialogHeader>
        
        {isCheckingLimits ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : limitReached ? (
          <div className="py-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-[15px] mb-2">Domain limit reached</h3>
              <p className="text-muted-foreground text-[13px] mb-4">
                Your {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan allows {DOMAIN_LIMITS[currentPlan]} domain{DOMAIN_LIMITS[currentPlan] === 1 ? '' : 's'}.
                <br />
                Upgrade to add more domains.
              </p>
              <Link href="/settings?tab=billing">
                <Button className="text-[13px]">
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="py-4">
              <Label htmlFor="domain">
                Domain
              </Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="mt-2"
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
              <p className="text-muted-foreground text-[11px] mt-2">
                {domainCount} of {DOMAIN_LIMITS[currentPlan] === -1 ? 'unlimited' : DOMAIN_LIMITS[currentPlan]} domains used
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!domain.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Domain'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
