import { createClient } from '@/lib/supabase/server'
import { Webhook } from 'lucide-react'
import { CreateWebhookButton } from '@/components/dashboard/create-webhook-button'
import { WebhooksList } from '@/components/dashboard/webhooks-list'

export default async function WebhooksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  const organizationId = membership?.organization_id

  // Get webhooks
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('id, url, events, enabled, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Receive real-time notifications for email events
          </p>
        </div>
        <CreateWebhookButton organizationId={organizationId} />
      </div>

      {/* Webhooks Section */}
      <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-[15px]">Your Webhooks</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Manage your webhook endpoints
            </p>
          </div>
        </div>
        
        {!webhooks || webhooks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Webhook className="w-6 h-6 text-stone-400" />
            </div>
            <p className="font-medium text-[14px] mb-1">No webhooks yet</p>
            <p className="text-muted-foreground text-[13px] mb-4">Add a webhook to receive real-time email events</p>
            <CreateWebhookButton organizationId={organizationId} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <WebhooksList webhooks={webhooks as { id: string; url: string; events: string[]; enabled: boolean; created_at: string }[]} />
          </div>
        )}
      </div>

      {/* Webhook Docs */}
      <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100">
          <h2 className="font-semibold text-[15px]">Webhook Payload</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Example webhook payload structure</p>
        </div>
        <div className="p-4 sm:p-5">
          <pre className="bg-stone-50 border border-stone-200 p-4 rounded-lg overflow-x-auto text-[12px]">
            <code>{`{
  "type": "email.delivered",
  "data": {
    "email_id": "em_xxx",
    "from": "hello@example.com",
    "to": ["user@example.com"],
    "subject": "Hello World"
  },
  "created_at": "2025-01-01T00:00:00Z"
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
