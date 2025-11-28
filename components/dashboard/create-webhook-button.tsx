'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
import { Loader2, Plus, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const EVENT_TYPES = [
  { value: 'email.sent', label: 'Sent' },
  { value: 'email.delivered', label: 'Delivered' },
  { value: 'email.bounced', label: 'Bounced' },
  { value: 'email.complained', label: 'Complained' },
  { value: 'email.opened', label: 'Opened' },
  { value: 'email.clicked', label: 'Clicked' },
  { value: 'email.failed', label: 'Failed' },
]

interface CreateWebhookButtonProps {
  organizationId: string
}

export function CreateWebhookButton({ organizationId }: CreateWebhookButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [newWebhook, setNewWebhook] = useState<{ id: string; secret: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    if (!url.trim()) {
      toast.error('Please enter a webhook URL')
      return
    }

    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event')
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Generate webhook secret
      const randomBytes = new Uint8Array(24)
      crypto.getRandomValues(randomBytes)
      const secret = 'whsec_' + Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 32)

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          organization_id: organizationId,
          url: url.trim(),
          events: selectedEvents,
          secret,
          enabled: true,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating webhook:', error)
        toast.error(error.message || 'Failed to create webhook')
        setIsLoading(false)
        return
      }

      setNewWebhook({ id: data.id, secret })
      setIsLoading(false)
      router.refresh()
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (newWebhook?.secret) {
      await navigator.clipboard.writeText(newWebhook.secret)
      setCopied(true)
      toast.success('Secret copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setUrl('')
    setSelectedEvents([])
    setNewWebhook(null)
    setCopied(false)
  }

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose()
      else setOpen(true)
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-[13px]">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Webhook
        </Button>
      </DialogTrigger>
      <DialogContent>
        {newWebhook ? (
          <>
            <DialogHeader>
              <DialogTitle>Webhook Created</DialogTitle>
              <DialogDescription>
                Save your webhook secret - it won&apos;t be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="text-[13px]">Webhook Secret</Label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 bg-stone-100 px-3 py-2 rounded-lg text-[13px] font-mono break-all">
                  {newWebhook.secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-[12px] text-muted-foreground mt-2">
                Use this secret to verify webhook signatures in your application.
              </p>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive email events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="webhook-url" className="text-[13px]">Endpoint URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-app.com/webhooks"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-2 text-[13px]"
                />
              </div>
              <div>
                <Label className="text-[13px]">Events</Label>
                <p className="text-[12px] text-muted-foreground mb-2">
                  Select the events you want to receive
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedEvents.includes(value)
                          ? 'border-stone-900 bg-stone-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(value)}
                        onChange={() => toggleEvent(value)}
                        className="rounded border-stone-300"
                      />
                      <span className="text-[13px]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={isLoading || !url.trim() || selectedEvents.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Create Webhook'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
