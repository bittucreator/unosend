'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SettingsForm } from '@/components/dashboard/settings-form'
import { WorkspaceSettings } from '@/components/dashboard/workspace-settings'
import { MembersSettings } from '@/components/dashboard/members-settings'
import { BillingSettings } from '@/components/dashboard/billing-settings'
import { UsageSettings } from '@/components/dashboard/usage-settings'
import { User, Building2, Users, CreditCard, BarChart3 } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface Organization {
  id: string
  name: string
  slug: string
  icon_url?: string | null
}

interface SettingsTabsProps {
  profile: Profile | null
  organization: Organization | null
  userRole: 'owner' | 'admin' | 'member'
  userId: string
}

const validTabs = ['profile', 'workspace', 'members', 'billing', 'usage']

export function SettingsTabs({ profile, organization, userRole, userId }: SettingsTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'profile'

  const handleTabChange = (value: string) => {
    router.push(`/settings?tab=${value}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="bg-stone-100 p-1 rounded-lg h-auto flex-wrap">
        <TabsTrigger value="profile" className="gap-2 text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <User className="h-3.5 w-3.5" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="workspace" className="gap-2 text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <Building2 className="h-3.5 w-3.5" />
          Workspace
        </TabsTrigger>
        <TabsTrigger value="members" className="gap-2 text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <Users className="h-3.5 w-3.5" />
          Members
        </TabsTrigger>
        <TabsTrigger value="billing" className="gap-2 text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <CreditCard className="h-3.5 w-3.5" />
          Billing
        </TabsTrigger>
        <TabsTrigger value="usage" className="gap-2 text-[13px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <BarChart3 className="h-3.5 w-3.5" />
          Usage
        </TabsTrigger>
      </TabsList>
          Integrations
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <User className="h-4 w-4 text-stone-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[15px]">Profile Settings</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Update your personal information
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <SettingsForm 
              profile={profile} 
              organization={organization} 
            />
          </div>
        </div>
      </TabsContent>

      {/* Workspace Tab */}
      <TabsContent value="workspace" className="space-y-6">
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Building2 className="h-4 w-4 text-stone-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[15px]">Workspace Settings</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Manage your workspace details
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            {organization ? (
              <WorkspaceSettings 
                organization={{
                  id: organization.id,
                  name: organization.name,
                  slug: organization.slug,
                  icon_url: organization.icon_url || null,
                }}
                userRole={userRole}
              />
            ) : (
              <p className="text-[13px] text-muted-foreground">No workspace found</p>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Members Tab */}
      <TabsContent value="members" className="space-y-6">
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Users className="h-4 w-4 text-stone-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[15px]">Team Members</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Manage who has access to this workspace
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            {organization ? (
              <MembersSettings 
                organizationId={organization.id}
                currentUserId={userId}
                userRole={userRole}
              />
            ) : (
              <p className="text-[13px] text-muted-foreground">No workspace found</p>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Billing Tab */}
      <TabsContent value="billing" className="space-y-6">
        {organization ? (
          <BillingSettings organizationId={organization.id} />
        ) : (
          <p className="text-[13px] text-muted-foreground">No workspace found</p>
        )}
      </TabsContent>

      {/* Usage Tab */}
      <TabsContent value="usage" className="space-y-6">
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-stone-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[15px]">Usage & Analytics</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Monitor your email sending activity
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            {organization ? (
              <UsageSettings organizationId={organization.id} />
            ) : (
              <p className="text-[13px] text-muted-foreground">No workspace found</p>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
