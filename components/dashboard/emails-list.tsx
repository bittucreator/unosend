'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Mail, CheckCircle, Clock, XCircle, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Email {
  id: string
  from_email: string
  from_name: string | null
  to_emails: string[]
  subject: string
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'
  created_at: string
  sent_at: string | null
}

interface EmailsListProps {
  emails: Email[]
}

export function EmailsList({ emails }: EmailsListProps) {
  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No emails sent yet</p>
        <p className="text-muted-foreground text-sm">Use the API to send your first email</p>
      </div>
    )
  }

  const statusConfig = {
    queued: { icon: Clock, color: 'bg-muted', label: 'Queued' },
    sent: { icon: Send, color: 'bg-muted', label: 'Sent' },
    delivered: { icon: CheckCircle, color: 'bg-muted', label: 'Delivered' },
    bounced: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Bounced' },
    failed: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Failed' },
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>To</TableHead>
          <TableHead>From</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.map((email) => {
          const status = statusConfig[email.status]
          const StatusIcon = status.icon

          return (
            <TableRow key={email.id}>
              <TableCell className="font-medium max-w-xs truncate">
                {email.subject}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {email.to_emails.join(', ')}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
