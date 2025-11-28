import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollText, CheckCircle, XCircle, Send, Clock, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function LogsPage() {
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

  // Get email events/logs
  const { data: emails } = await supabase
    .from('emails')
    .select(`
      id,
      from_email,
      to_emails,
      subject,
      status,
      created_at,
      sent_at,
      email_events (
        id,
        event_type,
        created_at,
        metadata
      )
    `)
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })
    .limit(100)

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    queued: { icon: Clock, color: 'bg-stone-100 text-stone-700', label: 'Queued' },
    sent: { icon: Send, color: 'bg-blue-50 text-blue-700', label: 'Sent' },
    delivered: { icon: CheckCircle, color: 'bg-green-50 text-green-700', label: 'Delivered' },
    bounced: { icon: XCircle, color: 'bg-red-50 text-red-700', label: 'Bounced' },
    failed: { icon: XCircle, color: 'bg-red-50 text-red-700', label: 'Failed' },
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Logs</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Search and filter your email activity
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input 
              placeholder="Search by email or subject..." 
              className="pl-9 h-9 text-[13px] border-stone-200" 
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-40 h-9 text-[13px] border-stone-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[13px]">All Status</SelectItem>
              <SelectItem value="sent" className="text-[13px]">Sent</SelectItem>
              <SelectItem value="delivered" className="text-[13px]">Delivered</SelectItem>
              <SelectItem value="bounced" className="text-[13px]">Bounced</SelectItem>
              <SelectItem value="failed" className="text-[13px]">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="7d">
            <SelectTrigger className="w-full sm:w-40 h-9 text-[13px] border-stone-200">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h" className="text-[13px]">Last hour</SelectItem>
              <SelectItem value="24h" className="text-[13px]">Last 24 hours</SelectItem>
              <SelectItem value="7d" className="text-[13px]">Last 7 days</SelectItem>
              <SelectItem value="30d" className="text-[13px]">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100">
          <h2 className="font-semibold text-[15px]">Activity Logs</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Real-time email activity and events</p>
        </div>
        
        {!emails || emails.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <ScrollText className="w-6 h-6 text-stone-400" />
            </div>
            <p className="font-medium text-[14px] mb-1">No logs yet</p>
            <p className="text-muted-foreground text-[13px]">Email activity will appear here once you start sending</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50 hover:bg-stone-50">
                  <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Time</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">To</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Subject</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => {
                  const status = statusConfig[email.status] || statusConfig.queued
                  const StatusIcon = status.icon
                  const events = email.email_events as Array<{ event_type: string }> || []

                  return (
                    <TableRow key={email.id} className="hover:bg-stone-50">
                      <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="font-mono text-[12px]">
                        {email.to_emails[0]}
                        {email.to_emails.length > 1 && (
                          <span className="text-muted-foreground"> +{email.to_emails.length - 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[13px] max-w-xs truncate">{email.subject}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${status.color} text-[11px] border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {events.map((event, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] border-stone-200">
                              {event.event_type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
