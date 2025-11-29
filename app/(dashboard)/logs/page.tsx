import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogsClient } from '@/components/dashboard/logs-client'

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

  const organizationId = membership?.organization_id || ''

  // Get initial emails (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  const { data: emails } = organizationId ? await supabase
    .from('emails')
    .select(`
      id,
      from_email,
      to_emails,
      subject,
      status,
      created_at,
      sent_at,
      scheduled_for,
      email_events (
        id,
        event_type,
        created_at,
        metadata
      )
    `)
    .eq('organization_id', organizationId)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(100) : { data: [] }

  return (
    <LogsClient 
      initialEmails={emails || []} 
      organizationId={organizationId} 
    />
  )
}
