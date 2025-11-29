'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Copy, Check, Loader2, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const API_KEY_LIMITS: Record<string, number> = {
  free: 2,
  pro: 10,
  scale: -1,
  enterprise: -1,
}

interface CreateApiKeyButtonProps {
  organizationId?: string
}

export function CreateApiKeyButton({ organizationId }: CreateApiKeyButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [expiresIn, setExpiresIn] = useState<string>('never')
  const [isLoading, setIsLoading] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [keyCount, setKeyCount] = useState(0)
  const [isCheckingLimits, setIsCheckingLimits] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    if (open && !newKey) {
      checkLimits()
    }
  }, [open])

  const checkLimits = async () => {
    setIsCheckingLimits(true)
    try {
      const supabase = createClient()
      
      // Get user's organization and plan
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization:organizations(id, plan)')
        .eq('user_id', user.id)
        .single()

      const org = membership?.organization as { id: string; plan: string } | null
      const plan = org?.plan || 'free'
      setCurrentPlan(plan)

      // Count existing API keys
      const { count } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org?.id)

      const currentCount = count || 0
      setKeyCount(currentCount)

      const limit = API_KEY_LIMITS[plan] ?? 2
      setLimitReached(limit !== -1 && currentCount >= limit)
    } catch (error) {
      console.error('Error checking limits:', error)
    } finally {
      setIsCheckingLimits(false)
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/dashboard/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          expires_in_days: expiresIn === 'never' ? null : parseInt(expiresIn),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to create API key')
        setIsLoading(false)
        return
      }

      setNewKey(data.key)
      setIsLoading(false)
      router.refresh()
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey)
      setCopied(true)
      toast.success('API key copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setName('')
    setExpiresIn('never')
    setNewKey(null)
    setCopied(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-[13px]">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Create Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        {newKey ? (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription>
                Copy your API key now. You won&apos;t be able to see it again!
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={newKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm mt-3">
                ⚠️ Make sure to copy your API key now. You won&apos;t be able to see it again!
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} variant="secondary">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : isCheckingLimits ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : limitReached ? (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give your API key a name and optionally set an expiration.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">API key limit reached</h3>
                <p className="text-muted-foreground text-[13px] mb-4">
                  Your {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan allows {API_KEY_LIMITS[currentPlan]} API key{API_KEY_LIMITS[currentPlan] === 1 ? '' : 's'}.
                  <br />
                  Upgrade to add more API keys.
                </p>
                <Link href="/settings?tab=billing">
                  <Button className="text-[13px]">
                    <Crown className="w-3.5 h-3.5 mr-1.5" />
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give your API key a name and optionally set an expiration.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production, Development"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="expires">Expiration</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never expires</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs mt-1.5">
                  Expiring keys are more secure for temporary access.
                </p>
              </div>
              <p className="text-muted-foreground text-[11px]">
                {keyCount} of {API_KEY_LIMITS[currentPlan] === -1 ? 'unlimited' : API_KEY_LIMITS[currentPlan]} API keys used
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Key'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
