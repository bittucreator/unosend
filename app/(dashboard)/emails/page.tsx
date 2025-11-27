import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmailsList } from '@/components/dashboard/emails-list'
import { Mail, Search, Filter, Download } from 'lucide-react'

export default async function EmailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const { data: emails, count } = await supabase
    .from('emails')
    .select('id, from_email, from_name, to_emails, subject, status, created_at, sent_at', { count: 'exact' })
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Get stats
  const sentCount = emails?.filter(e => e.status === 'sent' || e.status === 'delivered').length || 0
  const bouncedCount = emails?.filter(e => e.status === 'bounced' || e.status === 'failed').length || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Emails</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and track all emails sent from your account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {count || 0} total
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{count || 0}</p>
              </div>
              <Mail className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{sentCount}</p>
              </div>
              <Badge variant="default" className="text-xs">
                {count ? Math.round((sentCount / count) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bounced</p>
                <p className="text-2xl font-bold">{bouncedCount}</p>
              </div>
              <Badge variant="destructive" className="text-xs">
                {count ? Math.round((bouncedCount / count) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Email History</CardTitle>
              <CardDescription>
                A log of all emails sent through the API
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EmailsList emails={emails || []} />
        </CardContent>
      </Card>
    </div>
  )
}
