import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmailsList } from '@/components/dashboard/emails-list'
import { Mail, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Emails</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Monitor all emails sent through the API
          </p>
        </div>
        <Link href="https://docs.unosend.com/api" target="_blank">
          <Button variant="outline" size="sm" className="h-8 text-[13px]">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            API Docs
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Total Sent</p>
              <p className="text-2xl font-semibold mt-1">{count || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-stone-500" />
            </div>
          </div>
        </div>
        <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Delivered</p>
              <p className="text-2xl font-semibold mt-1">{sentCount}</p>
            </div>
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-0">
              {count ? Math.round((sentCount / count) * 100) : 0}%
            </Badge>
          </div>
        </div>
        <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Bounced</p>
              <p className="text-2xl font-semibold mt-1">{bouncedCount}</p>
            </div>
            <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-0">
              {count ? Math.round((bouncedCount / count) * 100) : 0}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Recent Emails Section */}
      <div className="border border-stone-200/60 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-[15px]">Recent Emails</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Emails sent through the API
            </p>
          </div>
          <Link href="/logs" className="text-[13px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            All Emails <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="p-4 sm:p-5">
          <EmailsList emails={emails || []} />
        </div>
      </div>
    </div>
  )
}
