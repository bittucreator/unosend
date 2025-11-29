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

// Broadcasts are Pro+ feature
const ALLOWED_PLANS = ['pro', 'scale', 'enterprise']

interface CreateBroadcastButtonProps {
  organizationId: string
  audiences: Array<{ id: string; name: string }>
  templates: Array<{ id: string; name: string; subject: string; html_content: string | null; text_content: string | null }>
  domains: Array<{ domain: string }>
}

export function CreateBroadcastButton({ organizationId, audiences, templates, domains }: CreateBroadcastButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [audienceId, setAudienceId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [isCheckingPlan, setIsCheckingPlan] = useState(false)
  const [isFreePlan, setIsFreePlan] = useState(true)

  useEffect(() => {
    if (open) {
      checkPlan()
    }
  }, [open])

  const checkPlan = async () => {
    setIsCheckingPlan(true)
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
      setIsFreePlan(!ALLOWED_PLANS.includes(plan))
    } catch (error) {
      console.error('Error checking plan:', error)
    } finally {
      setIsCheckingPlan(false)
    }
  }

  const handleTemplateChange = (id: string) => {
    setTemplateId(id)
    const template = templates.find(t => t.id === id)
    if (template) {
      setSubject(template.subject)
      setHtmlContent(template.html_content || template.text_content || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !subject || !fromEmail || !audienceId) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('broadcasts').insert({
        organization_id: organizationId,
        name,
        subject,
        from_email: fromEmail,
        from_name: fromName || null,
        audience_id: audienceId,
        template_id: templateId || null,
        html_content: htmlContent || null,
        status: 'draft',
      })

      if (error) throw error

      setOpen(false)
      setName('')
      setSubject('')
      setFromEmail('')
      setFromName('')
      setAudienceId('')
      setTemplateId('')
      setHtmlContent('')
      router.refresh()
    } catch (error) {
      console.error('Failed to create broadcast:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isCheckingPlan ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : isFreePlan ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Broadcast</DialogTitle>
              <DialogDescription>
                Send an email to your audience.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">Broadcasts are a Pro feature</h3>
                <p className="text-muted-foreground text-[13px] mb-4">
                  Marketing broadcasts and email campaigns are available on Pro and Scale plans.
                  <br />
                  Upgrade to start sending broadcasts.
                </p>
                <Link href="/settings?tab=billing">
                  <Button className="text-[13px]">
                    <Crown className="w-3.5 h-3.5 mr-1.5" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Broadcast</DialogTitle>
            <DialogDescription>
              Send an email to your audience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Broadcast Name</Label>
              <Input
                id="name"
                placeholder="November Newsletter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  placeholder="Your Company"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Select value={fromEmail} onValueChange={setFromEmail}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sender" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((d) => (
                      <SelectItem key={d.domain} value={`hello@${d.domain}`}>
                        hello@{d.domain}
                      </SelectItem>
                    ))}
                    {domains.map((d) => (
                      <SelectItem key={`noreply-${d.domain}`} value={`noreply@${d.domain}`}>
                        noreply@{d.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="audience">Audience</Label>
              <Select value={audienceId} onValueChange={setAudienceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((audience) => (
                    <SelectItem key={audience.id} value={audience.id}>
                      {audience.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="template">Template (optional)</Label>
              <Select value={templateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or write custom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Content</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Your monthly newsletter is here!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Email Content (HTML)</Label>
              <textarea
                id="content"
                className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                placeholder="<html><body><h1>Hello!</h1><p>Your content here...</p></body></html>"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name || !subject || !fromEmail || !audienceId}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Draft
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
