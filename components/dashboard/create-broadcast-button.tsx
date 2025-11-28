'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
      </DialogContent>
    </Dialog>
  )
}
