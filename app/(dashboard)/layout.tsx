import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from './dashboard-shell'

export interface Workspace {
  id: string
  name: string
  slug: string
  icon_url: string | null
  owner_id: string
  role: 'owner' | 'admin' | 'member'
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all user's organizations
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(id, name, slug, icon_url, owner_id)')
    .eq('user_id', user.id)

  const membership = memberships?.[0]

  // If no membership found, redirect to onboarding
  if (!membership || !membership.organizations) {
    redirect('/onboarding/workspace')
  }

  const org = Array.isArray(membership.organizations) 
    ? membership.organizations[0] 
    : membership.organizations

  // Build all workspaces list
  const allWorkspaces: Workspace[] = memberships?.map(m => {
    const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      icon_url: org.icon_url || null,
      owner_id: org.owner_id,
      role: m.role as 'owner' | 'admin' | 'member',
    }
  }) || []

  // Check for selected workspace in cookies
  const cookieStore = await cookies()
  const selectedWorkspaceId = cookieStore.get('selectedWorkspaceId')?.value
  
  // Find selected workspace or default to first one
  let currentOrg = org
  if (selectedWorkspaceId) {
    const selectedMembership = memberships?.find(m => {
      const o = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations
      return o.id === selectedWorkspaceId
    })
    if (selectedMembership) {
      currentOrg = Array.isArray(selectedMembership.organizations) 
        ? selectedMembership.organizations[0] 
        : selectedMembership.organizations
    }
  }

  return (
    <DashboardShell 
      user={user} 
      organization={currentOrg as { id: string; name: string; slug: string; icon_url?: string | null }}
      workspaces={allWorkspaces}
    >
      {children}
    </DashboardShell>
  )
}
