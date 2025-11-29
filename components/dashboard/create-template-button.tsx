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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TEMPLATE_LIMITS: Record<string, number> = {
  free: 3,
  pro: -1,
  scale: -1,
  enterprise: -1,
}

interface CreateTemplateButtonProps {
  organizationId: string
}

export function CreateTemplateButton({ organizationId }: CreateTemplateButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [type, setType] = useState<'html' | 'text'>('html')
  const [htmlContent, setHtmlContent] = useState('')
  const [textContent, setTextContent] = useState('')
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [templateCount, setTemplateCount] = useState(0)
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
        .from('templates')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org?.id)

      const currentCount = count || 0
      setTemplateCount(currentCount)

      const limit = TEMPLATE_LIMITS[plan] ?? 3
      setLimitReached(limit !== -1 && currentCount >= limit)
    } catch (error) {
      console.error('Error checking limits:', error)
    } finally {
      setIsCheckingLimits(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !subject) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('templates').insert({
        organization_id: organizationId,
        name,
        subject,
        type,
        html_content: htmlContent || null,
        text_content: textContent || null,
      })

      if (error) throw error

      setOpen(false)
      setName('')
      setSubject('')
      setType('html')
      setHtmlContent('')
      setTextContent('')
      router.refresh()
    } catch (error) {
      console.error('Failed to create template:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {isCheckingLimits ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : limitReached ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
              <DialogDescription>
                Create a reusable email template for your campaigns.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">Template limit reached</h3>
                <p className="text-muted-foreground text-[13px] mb-4">
                  Your {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan allows {TEMPLATE_LIMITS[currentPlan]} template{TEMPLATE_LIMITS[currentPlan] === 1 ? '' : 's'}.
                  <br />
                  Upgrade to add more templates.
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
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template for your campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="Welcome Email"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Welcome to {{company_name}}!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Template Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'html' | 'text')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === 'html' ? (
              <div className="grid gap-2">
                <Label htmlFor="html">HTML Content</Label>
                <textarea
                  id="html"
                  className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                  placeholder="<html><body><h1>Hello {{name}}!</h1></body></html>"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="text">Plain Text Content</Label>
                <textarea
                  id="text"
                  className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Hello {{name}}!"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
            )}
            <p className="text-muted-foreground text-[11px]">
              {templateCount} of {TEMPLATE_LIMITS[currentPlan] === -1 ? 'unlimited' : TEMPLATE_LIMITS[currentPlan]} templates used
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name || !subject}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
