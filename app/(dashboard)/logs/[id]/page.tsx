import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ApiLogDetailClient } from './client'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ApiLogDetailPage({ params }: Props) {
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

  // Fetch the API log
  const { data: log, error } = await supabase
    .from('api_logs')
    .select(`
      id,
      method,
      endpoint,
      path,
      status_code,
      user_agent,
      ip_address,
      request_body,
      response_body,
      duration_ms,
      created_at,
      api_key_id,
      api_keys (
        name,
        key_prefix
      )
    `)
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (error || !log) {
    notFound()
  }

  return <ApiLogDetailClient log={log} />
}
