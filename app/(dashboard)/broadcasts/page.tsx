import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Radio, Send, Clock, CheckCircle, Plus, ExternalLink } from 'lucide-react'

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

  const organizationId = membership?.organization_id

  // Fetch broadcasts from database
  const { data: broadcasts } = organizationId ? await supabase
    .from('broadcasts')
    .select('id, name, subject, status, sent_at, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false }) : { data: [] }

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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Broadcasts</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Send emails to your audience
          </p>
        </div>
        <Button asChild size="sm" className="h-8 text-[13px]">
          <Link href="/broadcasts/new">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Broadcast
          </Link>
        </Button>
      </div>

      {/* Broadcasts Section */}
      <div className="border border-stone-200/60 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Radio className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">All Broadcasts</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formattedBroadcasts.length} broadcast{formattedBroadcasts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          {formattedBroadcasts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Radio className="w-8 h-8 text-stone-400" />
              </div>
              <p className="font-medium text-[15px] mb-1">No broadcasts yet</p>
              <p className="text-[13px] text-muted-foreground mb-5">Create your first broadcast to send emails to your audience</p>
              <Button variant="outline" size="sm" className="border-stone-200" asChild>
                <a href="https://docs.unosend.co" target="_blank" rel="noopener noreferrer">
                  Documentation <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="border-stone-100">
                    <TableHead className="text-[13px] font-medium text-muted-foreground">Name</TableHead>
                    <TableHead className="hidden sm:table-cell text-[13px] font-medium text-muted-foreground">Subject</TableHead>
                    <TableHead className="hidden md:table-cell text-[13px] font-medium text-muted-foreground">Recipients</TableHead>
                    <TableHead className="text-[13px] font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="hidden sm:table-cell text-[13px] font-medium text-muted-foreground">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formattedBroadcasts.map((broadcast) => (
                    <TableRow key={broadcast.id} className="border-stone-100">
                      <TableCell className="font-medium text-[13px]">
                        {broadcast.name}
                        <span className="block sm:hidden text-xs text-muted-foreground mt-0.5 truncate">
                          {broadcast.subject}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[13px] hidden sm:table-cell">{broadcast.subject}</TableCell>
                      <TableCell className="hidden md:table-cell text-[13px]">{broadcast.recipients.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[11px] border-0 bg-stone-100 text-stone-600">
                          {broadcast.status === 'sent' && <CheckCircle className="w-3 h-3 mr-1 text-green-600" />}
                          {broadcast.status === 'sending' && <Send className="w-3 h-3 mr-1 text-blue-600" />}
                          {broadcast.status === 'scheduled' && <Clock className="w-3 h-3 mr-1 text-orange-600" />}
                          <span className="hidden sm:inline">{broadcast.status.charAt(0).toUpperCase() + broadcast.status.slice(1)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[13px] hidden sm:table-cell">
                        {broadcast.sent_at || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
