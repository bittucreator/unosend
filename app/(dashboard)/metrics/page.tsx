import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  MousePointer,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

export default async function MetricsPage() {
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

  // Get email stats
  const { data: emails } = organizationId ? await supabase
    .from('emails')
    .select('status')
    .eq('organization_id', organizationId) : { data: [] }

  const stats = {
    total: emails?.length || 0,
    sent: emails?.filter(e => e.status === 'sent').length || 0,
    delivered: emails?.filter(e => e.status === 'delivered').length || 0,
    bounced: emails?.filter(e => e.status === 'bounced').length || 0,
  }

  const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : '0'
  const bounceRate = stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Metrics</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Track your email performance and engagement
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-stone-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="deliverability" className="text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Deliverability</TabsTrigger>
          <TabsTrigger value="engagement" className="text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Mail className="w-3.5 h-3.5" />
                Total Sent
              </p>
              <p className="text-2xl font-semibold">{stats.total.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-1">All time</p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Delivered
              </p>
              <p className="text-2xl font-semibold">{stats.delivered.toLocaleString()}</p>
              <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                {deliveryRate}% delivery rate
              </p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5" />
                Opens
              </p>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-[11px] text-muted-foreground mt-1">0% open rate</p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <MousePointer className="w-3.5 h-3.5" />
                Clicks
              </p>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-[11px] text-muted-foreground mt-1">0% click rate</p>
            </div>
          </div>

          {/* Chart placeholder */}
          <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100">
              <h2 className="font-semibold text-[15px]">Email Volume</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">Emails sent over the last 30 days</p>
            </div>
            <div className="p-4 sm:p-5">
              <div className="h-64 flex items-center justify-center text-muted-foreground border border-stone-200/60 rounded-xl bg-stone-50">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-stone-400" />
                  </div>
                  <p className="text-[13px]">Chart coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deliverability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Send className="w-3.5 h-3.5" />
                Sent
              </p>
              <p className="text-2xl font-semibold">{stats.sent.toLocaleString()}</p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Delivered
              </p>
              <p className="text-2xl font-semibold">{stats.delivered.toLocaleString()}</p>
              <p className="text-[11px] text-green-600 mt-1">{deliveryRate}% rate</p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <XCircle className="w-3.5 h-3.5" />
                Bounced
              </p>
              <p className="text-2xl font-semibold">{stats.bounced.toLocaleString()}</p>
              <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                {bounceRate}% rate
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5" />
                Unique Opens
              </p>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-[11px] text-muted-foreground mt-1">0% of delivered</p>
            </div>

            <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-2">
                <MousePointer className="w-3.5 h-3.5" />
                Unique Clicks
              </p>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-[11px] text-muted-foreground mt-1">0% of delivered</p>
            </div>
          </div>

          <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100">
              <h2 className="font-semibold text-[15px]">Top Clicked Links</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">Most popular links in your emails</p>
            </div>
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
                <MousePointer className="w-6 h-6 text-stone-400" />
              </div>
              <p className="text-[13px] text-muted-foreground">No click data yet</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
