import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
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
  const orgData = membership?.organizations

  // If no membership found, create default workspace
  if (!membership || !orgData) {
    // Auto-create workspace
    const emailPrefix = user.email?.split('@')[0] || 'user'
    const workspaceName = emailPrefix
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) + "'s Workspace"
    
    const slug = emailPrefix
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30) + '-' + user.id.substring(0, 8)
    
    // Use admin client to bypass RLS
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: workspaceName,
        slug: slug,
        owner_id: user.id,
      })
      .select('id')
      .single()
    
    if (org && !orgError) {
      await supabaseAdmin
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner',
        })
      
      // Use router.refresh() pattern - redirect to current path or emails
      redirect('/emails')
    } else {
      console.error('Failed to create org:', orgError)
      // If org creation failed, show error
      redirect('/login?error=Failed to create workspace')
    }
  }

  const org = Array.isArray(orgData) 
    ? orgData[0] 
    : orgData

  // Build all workspaces list
  const allWorkspaces: Workspace[] = memberships?.map(m => {
    const orgItem = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations
    return {
      id: orgItem.id,
      name: orgItem.name,
      slug: orgItem.slug,
      icon_url: orgItem.icon_url || null,
      owner_id: orgItem.owner_id,
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
