import { createClient } from '@/lib/supabase/server'
import { SettingsTabs } from '@/components/dashboard/settings-tabs'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(id, name, slug, icon_url, owner_id)')
    .eq('user_id', user.id)

  const membership = memberships?.[0]
  const organization = membership?.organizations
  const org = Array.isArray(organization) ? organization[0] : organization
  const userRole = membership?.role as 'owner' | 'admin' | 'member' || 'member'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Manage your account and workspace settings
        </p>
      </div>

      <SettingsTabs 
        profile={profile}
        organization={org ? {
          id: org.id,
          name: org.name,
          slug: org.slug,
          icon_url: org.icon_url,
        } : null}
        userRole={userRole}
        userId={user.id}
      />
    </div>
  )
}
