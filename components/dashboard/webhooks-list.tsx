'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Trash2, ExternalLink, Loader2, Pencil, Play, History, CheckCircle, XCircle, Copy, Check, Eye } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'

interface Webhook {
  id: string
  url: string
  events: string[]
  enabled: boolean
  created_at: string
}

interface WebhookLog {
  id: string
  event_type: string
  response_status: number | null
  success: boolean
  error: string | null
  created_at: string
  metadata: { attempts?: number; test?: boolean } | null
}

interface WebhooksListProps {
  webhooks: Webhook[]
}

const eventLabels: Record<string, string> = {
  'email.sent': 'Sent',
  'email.delivered': 'Delivered',
  'email.bounced': 'Bounced',
  'email.complained': 'Complained',
  'email.opened': 'Opened',
  'email.clicked': 'Clicked',
  'email.failed': 'Failed',
  'test': 'Test',
}

const EVENT_TYPES = [
  { value: 'email.sent', label: 'Sent' },
  { value: 'email.delivered', label: 'Delivered' },
  { value: 'email.bounced', label: 'Bounced' },
  { value: 'email.complained', label: 'Complained' },
  { value: 'email.opened', label: 'Opened' },
  { value: 'email.clicked', label: 'Clicked' },
  { value: 'email.failed', label: 'Failed' },
]

export function WebhooksList({ webhooks }: WebhooksListProps) {
  const router = useRouter()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [editEvents, setEditEvents] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [logsWebhook, setLogsWebhook] = useState<Webhook | null>(null)
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [viewingSecret, setViewingSecret] = useState<{ id: string; secret: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleToggle = async (id: string, enabled: boolean) => {
    setTogglingId(id)

    const response = await fetch(`/api/dashboard/webhooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })

    if (!response.ok) {
      toast.error('Failed to update webhook')
    } else {
      toast.success(enabled ? 'Webhook enabled' : 'Webhook disabled')
      router.refresh()
    }

    setTogglingId(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)

    const response = await fetch(`/api/dashboard/webhooks/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      toast.error('Failed to delete webhook')
    } else {
      toast.success('Webhook deleted')
      router.refresh()
    }

    setDeletingId(null)
  }

  const handleTest = async (webhook: Webhook) => {
    setTestingId(webhook.id)

    try {
      const response = await fetch(`/api/dashboard/webhooks/${webhook.id}/test`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to send test webhook')
    }

    setTestingId(null)
  }

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook)
    setEditUrl(webhook.url)
    setEditEvents(webhook.events)
  }

  const handleSaveEdit = async () => {
    if (!editingWebhook) return
    setIsSaving(true)

    try {
      const response = await fetch(`/api/dashboard/webhooks/${editingWebhook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editUrl, events: editEvents }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to update webhook')
      } else {
        toast.success('Webhook updated')
        router.refresh()
        setEditingWebhook(null)
      }
    } catch {
      toast.error('Failed to update webhook')
    }

    setIsSaving(false)
  }

  const handleViewLogs = async (webhook: Webhook) => {
    setLogsWebhook(webhook)
    setLogsLoading(true)

    try {
      const response = await fetch(`/api/dashboard/webhooks/${webhook.id}/logs`)
      const data = await response.json()
      setLogs(data.logs || [])
    } catch {
      toast.error('Failed to load logs')
    }

    setLogsLoading(false)
  }

  const handleViewSecret = async (webhook: Webhook) => {
    try {
      const response = await fetch(`/api/dashboard/webhooks/${webhook.id}`)
      const data = await response.json()
      if (data.webhook?.secret) {
        setViewingSecret({ id: webhook.id, secret: data.webhook.secret })
      } else {
        toast.error('Failed to retrieve secret')
      }
    } catch {
      toast.error('Failed to retrieve secret')
    }
  }

  const handleCopySecret = async () => {
    if (viewingSecret) {
      await navigator.clipboard.writeText(viewingSecret.secret)
      setCopied(true)
      toast.success('Secret copied')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleEvent = (event: string) => {
    setEditEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    )
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow className="bg-stone-50 hover:bg-stone-50">
          <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Endpoint</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Events</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Status</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Created</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {webhooks.map((webhook) => (
          <TableRow key={webhook.id} className="hover:bg-stone-50">
            <TableCell>
              <div className="flex items-center gap-2">
                <code className="text-[12px] bg-stone-100 px-2 py-1 rounded max-w-xs truncate">
                  {webhook.url}
                </code>
                <a href={webhook.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 hover:text-stone-600" />
                </a>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {webhook.events.slice(0, 3).map((event) => (
                  <Badge key={event} variant="secondary" className="text-[10px] bg-stone-100 text-stone-700 border-0">
                    {eventLabels[event] || event}
                  </Badge>
                ))}
                {webhook.events.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] bg-stone-100 text-stone-700 border-0">
                    +{webhook.events.length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={webhook.enabled}
                  disabled={togglingId === webhook.id}
                  onCheckedChange={(checked) => handleToggle(webhook.id, checked)}
                />
                <span className="text-[12px] text-muted-foreground">
                  {togglingId === webhook.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : webhook.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-[13px] text-muted-foreground">
              {formatDistanceToNow(new Date(webhook.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-stone-400 hover:text-stone-600"
                  onClick={() => handleTest(webhook)}
                  disabled={testingId === webhook.id || !webhook.enabled}
                  title="Send test webhook"
                >
                  {testingId === webhook.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-stone-400 hover:text-stone-600"
                  onClick={() => handleViewLogs(webhook)}
                  title="View delivery logs"
                >
                  <History className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-stone-400 hover:text-stone-600"
                  onClick={() => handleViewSecret(webhook)}
                  title="View secret"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-stone-400 hover:text-stone-600"
                  onClick={() => handleEdit(webhook)}
                  title="Edit webhook"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-stone-400 hover:text-red-600"
                      disabled={deletingId === webhook.id}
                      title="Delete webhook"
                    >
                      {deletingId === webhook.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this webhook? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(webhook.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Edit Dialog */}
    <Dialog open={!!editingWebhook} onOpenChange={(open) => !open && setEditingWebhook(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Webhook</DialogTitle>
          <DialogDescription>Update your webhook endpoint and events</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-url" className="text-[13px]">Endpoint URL</Label>
            <Input
              id="edit-url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="mt-2 text-[13px]"
            />
          </div>
          <div>
            <Label className="text-[13px]">Events</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {EVENT_TYPES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    editEvents.includes(value)
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={editEvents.includes(value)}
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
          <Button variant="ghost" onClick={() => setEditingWebhook(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} disabled={isSaving || !editUrl.trim() || editEvents.length === 0}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* View Secret Dialog */}
    <Dialog open={!!viewingSecret} onOpenChange={(open) => { if (!open) { setViewingSecret(null); setCopied(false); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Webhook Secret</DialogTitle>
          <DialogDescription>Use this secret to verify webhook signatures</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-stone-100 px-3 py-2 rounded-lg text-[12px] font-mono break-all">
              {viewingSecret?.secret}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopySecret}>
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => { setViewingSecret(null); setCopied(false); }}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Logs Sheet */}
    <Sheet open={!!logsWebhook} onOpenChange={(open) => !open && setLogsWebhook(null)}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Delivery Logs</SheetTitle>
          <SheetDescription className="truncate">{logsWebhook?.url}</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No delivery logs yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {eventLabels[log.event_type] || log.event_type}
                      </Badge>
                      {log.metadata?.test && (
                        <Badge variant="outline" className="text-[10px]">Test</Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    {log.success ? (
                      <span>HTTP {log.response_status}</span>
                    ) : (
                      <span className="text-red-600">{log.error}</span>
                    )}
                    {log.metadata?.attempts && log.metadata.attempts > 1 && (
                      <span className="ml-2">({log.metadata.attempts} attempts)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
    </>
  )
}
