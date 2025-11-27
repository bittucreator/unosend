'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Plus, Loader2 } from 'lucide-react'

interface AddDomainButtonProps {
  organizationId: string
}

export function AddDomainButton({ organizationId }: AddDomainButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [domain, setDomain] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
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
      </DialogContent>
    </Dialog>
  )
}
