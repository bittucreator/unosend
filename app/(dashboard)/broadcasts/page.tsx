import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Radio, Send, Clock, CheckCircle } from 'lucide-react'

export default async function BroadcastsPage() {
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

  // Fetch broadcasts from database
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('id, name, subject, status, sent_at, created_at')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })

  // Get recipient counts for each broadcast
  const broadcastIds = (broadcasts || []).map(b => b.id)
  const { data: recipientCounts } = broadcastIds.length > 0
    ? await supabase
        .from('broadcast_recipients')
        .select('broadcast_id')
        .in('broadcast_id', broadcastIds)
    : { data: [] }

  // Count recipients per broadcast
  const countMap: Record<string, number> = {}
  ;(recipientCounts || []).forEach(r => {
    countMap[r.broadcast_id] = (countMap[r.broadcast_id] || 0) + 1
  })

  const formattedBroadcasts = (broadcasts || []).map(b => ({
    ...b,
    recipients: countMap[b.id] || 0,
    sent_at: b.sent_at ? new Date(b.sent_at).toLocaleDateString() : null,
    created_at: new Date(b.created_at).toLocaleDateString()
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Broadcasts</h1>
          <p className="text-muted-foreground mt-1">Send emails to your audience</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Broadcast
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Broadcasts</CardTitle>
          <CardDescription>Manage and track your email broadcasts</CardDescription>
        </CardHeader>
        <CardContent>
          {formattedBroadcasts.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No broadcasts yet</p>
              <p className="text-muted-foreground text-sm mb-4">Create your first broadcast to send emails to your audience</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Broadcast
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedBroadcasts.map((broadcast) => (
                  <TableRow key={broadcast.id}>
                    <TableCell className="font-medium">{broadcast.name}</TableCell>
                    <TableCell className="text-muted-foreground">{broadcast.subject}</TableCell>
                    <TableCell>{broadcast.recipients.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {broadcast.status === 'sent' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {broadcast.status === 'sending' && <Send className="w-3 h-3 mr-1" />}
                        {broadcast.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                        {broadcast.status.charAt(0).toUpperCase() + broadcast.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {broadcast.sent_at || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
