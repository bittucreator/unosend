import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Plus, Webhook, Trash2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function WebhooksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  const organizationId = membership?.organization_id

  // Get webhooks
  const { data: webhooks } = organizationId ? await supabase
    .from('webhooks')
    .select('id, url, events, enabled, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false }) : { data: [] }

  const eventLabels: Record<string, string> = {
    'email.sent': 'Sent',
    'email.delivered': 'Delivered',
    'email.bounced': 'Bounced',
    'email.complained': 'Complained',
    'email.opened': 'Opened',
    'email.clicked': 'Clicked',
    'email.failed': 'Failed',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Receive real-time notifications for email events
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-[13px]">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive email events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="url" className="text-[13px]">Endpoint URL</Label>
                <Input id="url" placeholder="https://your-app.com/webhooks" className="mt-2 text-[13px]" />
              </div>
              <div>
                <Label className="text-[13px]">Events</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(eventLabels).map(([event, label]) => (
                    <div key={event} className="flex items-center space-x-2">
                      <input type="checkbox" id={event} className="rounded" />
                      <label htmlFor={event} className="text-[13px]">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" size="sm">Cancel</Button>
              <Button size="sm">Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks Section */}
      <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-[15px]">Your Webhooks</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Manage your webhook endpoints
            </p>
          </div>
        </div>
        
        {!webhooks || webhooks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Webhook className="w-6 h-6 text-stone-400" />
            </div>
            <p className="font-medium text-[14px] mb-1">No webhooks yet</p>
            <p className="text-muted-foreground text-[13px] mb-4">Add a webhook to receive real-time email events</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-[13px]">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a webhook endpoint to receive email events
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="url2" className="text-[13px]">Endpoint URL</Label>
                    <Input id="url2" placeholder="https://your-app.com/webhooks" className="mt-2 text-[13px]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button size="sm">Create Webhook</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                        {(webhook.events as string[]).slice(0, 3).map((event) => (
                          <Badge key={event} variant="secondary" className="text-[10px] bg-stone-100 text-stone-700 border-0">
                            {eventLabels[event] || event}
                          </Badge>
                        ))}
                        {(webhook.events as string[]).length > 3 && (
                          <Badge variant="secondary" className="text-[10px] bg-stone-100 text-stone-700 border-0">
                            +{(webhook.events as string[]).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={webhook.enabled} />
                        <span className="text-[12px] text-muted-foreground">
                          {webhook.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {formatDistanceToNow(new Date(webhook.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Webhook Docs */}
      <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100">
          <h2 className="font-semibold text-[15px]">Webhook Payload</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Example webhook payload structure</p>
        </div>
        <div className="p-4 sm:p-5">
          <pre className="bg-stone-50 border border-stone-200/60 p-4 rounded-lg overflow-x-auto text-[12px]">
            <code>{`{
  "type": "email.delivered",
  "data": {
    "email_id": "em_xxx",
    "from": "hello@example.com",
    "to": ["user@example.com"],
    "subject": "Hello World"
  },
  "created_at": "2025-01-01T00:00:00Z"
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
