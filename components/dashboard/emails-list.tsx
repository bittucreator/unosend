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
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

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
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead className="hidden sm:table-cell">To</TableHead>
            <TableHead className="hidden md:table-cell">From</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => {
            const status = statusConfig[email.status]
            const StatusIcon = status.icon

            return (
              <TableRow 
                key={email.id} 
                className="cursor-pointer hover:bg-stone-50"
                onClick={() => router.push(`/emails/${email.id}`)}
              >
                <TableCell className="font-medium max-w-[200px] sm:max-w-xs truncate">
                  {email.subject}
                  {/* Show To on mobile */}
                  <span className="block sm:hidden text-xs text-muted-foreground mt-0.5 truncate">
                    To: {email.to_emails[0]}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate hidden sm:table-cell">
                  {email.to_emails.join(', ')}
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={status.color}>
                    <StatusIcon className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">{status.label}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                  {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
