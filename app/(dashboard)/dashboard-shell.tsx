'use client'

import { useState } from 'react'
import { TopNav } from '@/components/dashboard/top-nav'
import { Sidebar } from '@/components/dashboard/sidebar'
import { CommandPalette } from '@/components/command-palette'
import type { User } from '@supabase/supabase-js'
import type { Workspace } from './layout'

interface DashboardShellProps {
  user: User
  organization: {
    id: string
    name: string
    slug: string
    icon_url?: string | null
  }
  workspaces: Workspace[]
  children: React.ReactNode
}

export function DashboardShell({ user, organization, workspaces, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      <CommandPalette />
      <Sidebar 
        user={user}
        organization={organization}
        workspaces={workspaces}
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col">
        <TopNav 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <div className="w-full max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
