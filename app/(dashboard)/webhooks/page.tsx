import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  if (!membership) {
    redirect('/login')
  }

  // Get webhooks
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('id, url, events, enabled, created_at')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground mt-1">Receive real-time notifications for email events</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
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
                <Label htmlFor="url">Endpoint URL</Label>
                <Input id="url" placeholder="https://your-app.com/webhooks" className="mt-2" />
              </div>
              <div>
                <Label>Events</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(eventLabels).map(([event, label]) => (
                    <div key={event} className="flex items-center space-x-2">
                      <input type="checkbox" id={event} className="rounded" />
                      <label htmlFor={event} className="text-sm">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost">Cancel</Button>
              <Button>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Webhooks</CardTitle>
          <CardDescription>Manage your webhook endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {!webhooks || webhooks.length === 0 ? (
            <div className="text-center py-12">
              <Webhook className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No webhooks yet</p>
              <p className="text-muted-foreground text-sm mb-4">Add a webhook to receive real-time email events</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
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
                      <Label htmlFor="url2">Endpoint URL</Label>
                      <Input id="url2" placeholder="https://your-app.com/webhooks" className="mt-2" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button>Create Webhook</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded max-w-xs truncate">
                          {webhook.url}
                        </code>
                        <a href={webhook.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(webhook.events as string[]).slice(0, 3).map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {eventLabels[event] || event}
                          </Badge>
                        ))}
                        {(webhook.events as string[]).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(webhook.events as string[]).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={webhook.enabled} />
                        <span className="text-sm text-muted-foreground">
                          {webhook.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(webhook.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Webhook Docs */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Payload</CardTitle>
          <CardDescription>Example webhook payload structure</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
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
        </CardContent>
      </Card>
    </div>
  )
}
