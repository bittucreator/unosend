'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const AUDIENCE_LIMITS: Record<string, number> = {
  free: 2,
  pro: 10,
  scale: -1,
  enterprise: -1,
}

interface CreateAudienceButtonProps {
  organizationId: string
}

export function CreateAudienceButton({ organizationId }: CreateAudienceButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [audienceCount, setAudienceCount] = useState(0)
  const [isCheckingLimits, setIsCheckingLimits] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    if (open) {
      checkLimits()
    }
  }, [open])

  const checkLimits = async () => {
    setIsCheckingLimits(true)
    try {
      const supabase = createClient()
      
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

      const { count } = await supabase
        .from('audiences')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org?.id)

      const currentCount = count || 0
      setAudienceCount(currentCount)

      const limit = AUDIENCE_LIMITS[plan] ?? 2
      setLimitReached(limit !== -1 && currentCount >= limit)
    } catch (error) {
      console.error('Error checking limits:', error)
    } finally {
      setIsCheckingLimits(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setLoading(true)
    try {
      const response = await fetch('/api/dashboard/audiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create audience')
      }

      toast.success('Audience created')
      setOpen(false)
      setName('')
      setDescription('')
      router.refresh()
    } catch (error) {
      console.error('Failed to create audience:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create audience')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-[13px]">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Audience
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isCheckingLimits ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : limitReached ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Audience</DialogTitle>
              <DialogDescription>
                Create a new audience to organize your contacts.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">Audience limit reached</h3>
                <p className="text-muted-foreground text-[13px] mb-4">
                  Your {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan allows {AUDIENCE_LIMITS[currentPlan]} audience{AUDIENCE_LIMITS[currentPlan] === 1 ? '' : 's'}.
                  <br />
                  Upgrade to add more audiences.
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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Audience</DialogTitle>
            <DialogDescription>
              Create a new audience to organize your contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Audience Name</Label>
              <Input
                id="name"
                placeholder="Newsletter Subscribers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="People who signed up for our newsletter"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <p className="text-muted-foreground text-[11px]">
              {audienceCount} of {AUDIENCE_LIMITS[currentPlan] === -1 ? 'unlimited' : AUDIENCE_LIMITS[currentPlan]} audiences used
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Audience
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
