'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Webhook {
  id: string
  url: string
  events: string[]
  enabled: boolean
  created_at: string
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
}

export function WebhooksList({ webhooks }: WebhooksListProps) {
  const router = useRouter()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleToggle = async (id: string, enabled: boolean) => {
    setTogglingId(id)
    const supabase = createClient()

    const { error } = await supabase
      .from('webhooks')
      .update({ enabled })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update webhook')
    } else {
      toast.success(enabled ? 'Webhook enabled' : 'Webhook disabled')
    }

    setTogglingId(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete webhook')
    } else {
      toast.success('Webhook deleted')
    }

    setDeletingId(null)
    router.refresh()
  }

  return (
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-stone-400 hover:text-red-600"
                    disabled={deletingId === webhook.id}
                  >
                    {deletingId === webhook.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
