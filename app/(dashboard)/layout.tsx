import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
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
  const { data: memberships, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(id, name, slug, icon_url, owner_id)')
    .eq('user_id', user.id)

  const membership = memberships?.[0]

  // If no membership found, show setup required message instead of redirecting
  // This prevents redirect loops when database isn't fully set up
  if (!membership || !membership.organizations) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <CardTitle>Setup Required</CardTitle>
            </div>
            <CardDescription>
              Your account needs to be set up before you can access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-sm">
              <p className="mb-2">This usually means:</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>The database migrations haven&apos;t been run yet</li>
                <li>The database triggers weren&apos;t created properly</li>
                <li>You need to run the SQL migration in Supabase</li>
              </ul>
              {membershipError && (
                <p className="text-destructive mt-3 text-xs">
                  Error: {membershipError.message}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <a href="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </a>
              <a href="/dashboard" className="flex-1">
                <Button className="w-full">
                  Retry
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
