import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Eye, 
  MousePointer,
  Copy,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'

interface EmailEvent {
  id: string
  event_type: string
  metadata: Record<string, unknown> | null
  created_at: string
}

interface EmailDetailProps {
  params: Promise<{ id: string }>
}

export default async function EmailDetailPage({ params }: EmailDetailProps) {
  const { id } = await params
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
    redirect('/dashboard')
  }

  // Get email with events
  const { data: email, error } = await supabase
    .from('emails')
    .select(`
      id,
      from_email,
      from_name,
      to_emails,
      cc_emails,
      bcc_emails,
      reply_to,
      subject,
      html_content,
      text_content,
      status,
      created_at,
      sent_at,
      delivered_at,
      opened_at,
      provider_message_id,
      metadata,
      email_events (
        id,
        event_type,
        metadata,
        created_at
      )
    `)
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (error || !email) {
    notFound()
  }

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string; bgColor: string }> = {
    queued: { icon: Clock, color: 'text-stone-700', label: 'Queued', bgColor: 'bg-stone-100' },
    sent: { icon: Send, color: 'text-blue-700', label: 'Sent', bgColor: 'bg-blue-50' },
    delivered: { icon: CheckCircle, color: 'text-green-700', label: 'Delivered', bgColor: 'bg-green-50' },
    bounced: { icon: XCircle, color: 'text-red-700', label: 'Bounced', bgColor: 'bg-red-50' },
    failed: { icon: XCircle, color: 'text-red-700', label: 'Failed', bgColor: 'bg-red-50' },
  }

  const eventTypeConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string }> = {
    sent: { icon: Send, label: 'Sent', color: 'text-blue-600' },
    delivered: { icon: CheckCircle, label: 'Delivered', color: 'text-green-600' },
    bounced: { icon: XCircle, label: 'Bounced', color: 'text-red-600' },
    failed: { icon: XCircle, label: 'Failed', color: 'text-red-600' },
    opened: { icon: Eye, label: 'Opened', color: 'text-purple-600' },
    clicked: { icon: MousePointer, label: 'Clicked', color: 'text-indigo-600' },
  }

  const status = statusConfig[email.status] || statusConfig.queued
  const StatusIcon = status.icon

  const events = (email.email_events as EmailEvent[]) || []

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/emails">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight truncate max-w-lg">
              {email.subject}
            </h1>
            <Badge className={`${status.bgColor} ${status.color} border-0`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">
            Sent {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[13px] text-muted-foreground">From</p>
                  <p className="text-sm font-medium mt-0.5">
                    {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">To</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {email.to_emails.map((to: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        {to}
                      </Badge>
                    ))}
                  </div>
                </div>
                {email.cc_emails && email.cc_emails.length > 0 && (
                  <div>
                    <p className="text-[13px] text-muted-foreground">CC</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {email.cc_emails.map((cc: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {cc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {email.bcc_emails && email.bcc_emails.length > 0 && (
                  <div>
                    <p className="text-[13px] text-muted-foreground">BCC</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {email.bcc_emails.map((bcc: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {bcc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {email.reply_to && (
                  <div>
                    <p className="text-[13px] text-muted-foreground">Reply To</p>
                    <p className="text-sm font-medium mt-0.5">{email.reply_to}</p>
                  </div>
                )}
                <div>
                  <p className="text-[13px] text-muted-foreground">Subject</p>
                  <p className="text-sm font-medium mt-0.5">{email.subject}</p>
                </div>
              </div>

              {/* ID and Message ID */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-muted-foreground">Email ID</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{email.id}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {email.provider_message_id && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] text-muted-foreground">Provider Message ID</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate max-w-xs">
                        {email.provider_message_id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Preview</CardTitle>
              <CardDescription>Preview of the email content</CardDescription>
            </CardHeader>
            <CardContent>
              {email.html_content ? (
                <div className="border rounded-lg bg-white p-4 max-h-[500px] overflow-auto">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: email.html_content }}
                  />
                </div>
              ) : email.text_content ? (
                <pre className="text-sm bg-stone-50 p-4 rounded-lg whitespace-pre-wrap font-mono">
                  {email.text_content}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">No content available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Timeline */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
              <CardDescription>Track email delivery events</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events recorded yet
                </p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3.5 top-2 bottom-2 w-px bg-stone-200" />
                  
                  <div className="space-y-4">
                    {events
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((event, index) => {
                        const eventConfig = eventTypeConfig[event.event_type] || {
                          icon: Mail,
                          label: event.event_type,
                          color: 'text-stone-600'
                        }
                        const EventIcon = eventConfig.icon

                        return (
                          <div key={event.id || index} className="relative flex gap-3 pl-1">
                            <div className={`w-6 h-6 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center z-10`}>
                              <EventIcon className={`w-3 h-3 ${eventConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{eventConfig.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                              </p>
                              {event.metadata && typeof event.metadata === 'object' && 'url' in event.metadata && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate max-w-[150px]">
                                      {String(event.metadata.url)}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {format(new Date(email.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              {email.sent_at && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-medium">
                    {format(new Date(email.sent_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
              {email.delivered_at && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-medium">
                    {format(new Date(email.delivered_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
              {email.opened_at && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">First Opened</span>
                  <span className="font-medium">
                    {format(new Date(email.opened_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {email.metadata?.tags && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {(email.metadata.tags as Array<{name: string; value: string}>).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag.name}: {tag.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
