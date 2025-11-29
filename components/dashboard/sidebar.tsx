'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { 
  Mail, 
  Radio,
  FileText,
  Users,
  BarChart3,
  Globe,
  ScrollText,
  Key,
  Webhook,
  Settings,
  X,
  UserPlus,
  LogOut,
  ChevronDown,
  CreditCard,
  ArrowLeftRight,
  Check,
  Plus,
  Upload,
  PanelLeftClose,
  PanelLeft,
  Crown,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Plan limits for workspaces and team members
const WORKSPACE_LIMITS: Record<string, number> = {
  free: 1,
  pro: 2,
  scale: 5,
  enterprise: -1,
}

const TEAM_MEMBER_LIMITS: Record<string, number> = {
  free: 1,
  pro: 10,
  scale: 100,
  enterprise: -1,
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/emails', label: 'Emails', icon: Mail },
  { href: '/broadcasts', label: 'Broadcasts', icon: Radio },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/audience', label: 'Audience', icon: Users },
  { href: '/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/logs', label: 'Logs', icon: ScrollText },
  { href: '/api-keys', label: 'API Keys', icon: Key },
  { href: '/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export interface Workspace {
  id: string
  name: string
  slug: string
  icon_url: string | null
  owner_id: string
  role: 'owner' | 'admin' | 'member'
}

interface SidebarProps {
  user: User
  organization: {
    id: string
    name: string
    slug: string
    icon_url?: string | null
  }
  workspaces: Workspace[]
  isOpen?: boolean
  onClose?: () => void
}

interface Member {
  id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export function Sidebar({ user, organization, workspaces, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceIcon, setWorkspaceIcon] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Limits state
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [isCheckingWorkspaceLimit, setIsCheckingWorkspaceLimit] = useState(false)
  const [workspaceLimitReached, setWorkspaceLimitReached] = useState(false)
  const [isCheckingMemberLimit, setIsCheckingMemberLimit] = useState(false)
  const [memberLimitReached, setMemberLimitReached] = useState(false)
  const [memberCount, setMemberCount] = useState(0)

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  // Check workspace limit when create dialog opens
  const checkWorkspaceLimit = async () => {
    setIsCheckingWorkspaceLimit(true)
    try {
      const supabase = createClient()
      
      // Get user's plan from current organization
      const { data: org } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', organization.id)
        .single()

      const plan = org?.plan || 'free'
      setCurrentPlan(plan)

      const limit = WORKSPACE_LIMITS[plan] ?? 1
      const currentCount = workspaces.length
      setWorkspaceLimitReached(limit !== -1 && currentCount >= limit)
    } catch (error) {
      console.error('Error checking workspace limit:', error)
    } finally {
      setIsCheckingWorkspaceLimit(false)
    }
  }

  // Check member limit when invite dialog opens
  const checkMemberLimit = async () => {
    setIsCheckingMemberLimit(true)
    try {
      const supabase = createClient()
      
      // Get organization plan
      const { data: org } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', organization.id)
        .single()

      const plan = org?.plan || 'free'
      setCurrentPlan(plan)

      // Count current members
      const { count } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)

      const currentCount = count || 0
      setMemberCount(currentCount)

      const limit = TEAM_MEMBER_LIMITS[plan] ?? 1
      setMemberLimitReached(limit !== -1 && currentCount >= limit)
    } catch (error) {
      console.error('Error checking member limit:', error)
    } finally {
      setIsCheckingMemberLimit(false)
    }
  }

  // Check limits when dialogs open
  useEffect(() => {
    if (createWorkspaceOpen) {
      checkWorkspaceLimit()
    }
  }, [createWorkspaceOpen])

  useEffect(() => {
    if (inviteDialogOpen) {
      checkMemberLimit()
    }
  }, [inviteDialogOpen])

  // Fetch members when dialog opens
  const fetchMembers = async () => {
    setIsLoadingMembers(true)
    try {
      const response = await fetch(`/api/v1/members?workspaceId=${organization.id}`)
      const result = await response.json()
      if (response.ok) {
        setMembers(result.data || [])
      }
    } catch {
      toast.error('Failed to load members')
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/v1/members?memberId=${memberId}&workspaceId=${organization.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to remove member')
      }

      toast.success('Member removed')
      fetchMembers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleInviteMember = async () => {
    if (!inviteEmail) return
    
    try {
      const response = await fetch('/api/v1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          workspaceId: organization.id,
          role: 'member',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite member')
      }

      toast.success(result.data.message)
      setInviteEmail('')
      setInviteDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to invite member')
    }
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setWorkspaceIcon(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name')
      return
    }
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/v1/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workspaceName.trim(),
          icon_url: workspaceIcon,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create workspace')
      }

      toast.success(`Workspace "${workspaceName}" created successfully!`)
      setCreateWorkspaceOpen(false)
      setWorkspaceName('')
      setWorkspaceIcon(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create workspace')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSwitchWorkspace = (workspaceId: string) => {
    document.cookie = `selectedWorkspaceId=${workspaceId}; path=/; max-age=31536000`
    router.refresh()
    toast.success('Switched workspace')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={onClose}
          />
        )}
        
        <aside className={cn(
          "fixed md:relative z-50 md:z-auto",
          "border-r",
          "h-screen",
          "transition-all duration-200 ease-in-out",
          "md:translate-x-0 flex flex-col",
          "bg-[#fafafa]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-[60px]" : "w-64 md:w-[230px]"
        )}>
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <span className="font-semibold">Menu</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Workspace Dropdown */}
          <div className="p-2 hidden md:block">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f0f0f0] transition-colors",
                    isCollapsed ? "w-10 justify-center" : "flex-1"
                  )}>
                    {organization.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={organization.icon_url} 
                        alt={organization.name} 
                        className="w-6 h-6 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center shrink-0">
                        <span className="text-white font-semibold text-xs">{organization.name.charAt(0)}</span>
                      </div>
                    )}
                    {!isCollapsed && (
                      <>
                        <span className="text-[13px] font-medium truncate flex-1 text-left">{organization.name}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4} className="w-[220px] p-1">
                  {/* User info */}
                  <div className="px-2 py-2">
                    <p className="text-[14px] font-medium">{user.email?.split('@')[0] || 'User'}</p>
                    <p className="text-[12px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  
                  {/* Settings */}
                  <DropdownMenuItem asChild className="rounded-md">
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2.5 text-muted-foreground" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  {/* Switch workspaces - with submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer rounded-md">
                      <ArrowLeftRight className="w-4 h-4 mr-2.5 text-muted-foreground" />
                      Switch workspaces
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent sideOffset={8} className="w-56 p-1">
                        <div className="px-2 py-1.5 text-[11px] text-muted-foreground">Workspaces</div>
                        {workspaces.map((workspace) => (
                          <DropdownMenuItem 
                            key={workspace.id}
                            className="cursor-pointer rounded-md"
                            onClick={() => {
                              if (workspace.id !== organization.id) {
                                handleSwitchWorkspace(workspace.id)
                              }
                            }}
                          >
                            {workspace.icon_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={workspace.icon_url} 
                                alt={workspace.name} 
                                className="w-5 h-5 rounded object-cover mr-2"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center mr-2">
                                <span className="text-white font-semibold text-[10px]">{workspace.name.charAt(0)}</span>
                              </div>
                            )}
                            <span className="flex-1 text-[13px] truncate">{workspace.name}</span>
                            {workspace.id === organization.id && (
                              <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem className="cursor-pointer rounded-md" onClick={() => setCreateWorkspaceOpen(true)}>
                          <Plus className="w-4 h-4 mr-2 text-muted-foreground" />
                          Create new workspace
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  
                  {/* Manage members */}
                  <DropdownMenuItem className="cursor-pointer rounded-md" onClick={() => setMembersDialogOpen(true)}>
                    <Users className="w-4 h-4 mr-2.5 text-muted-foreground" />
                    Manage members
                  </DropdownMenuItem>
                  
                  {/* Billing */}
                  <DropdownMenuItem asChild className="rounded-md">
                    <Link href="/settings" className="cursor-pointer">
                      <CreditCard className="w-4 h-4 mr-2.5 text-muted-foreground" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  {/* Logout */}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer rounded-md">
                    <LogOut className="w-4 h-4 mr-2.5 text-muted-foreground" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Collapse toggle button */}
              {!isCollapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleCollapse}
                      className="h-8 w-8 shrink-0 hover:bg-[#f0f0f0] rounded-lg flex items-center justify-center transition-colors"
                    >
                      <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <p>Collapse sidebar</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Expand button when collapsed */}
            {isCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCollapse}
                    className="h-8 w-full mt-1 hover:bg-[#f0f0f0] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <PanelLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>Expand sidebar</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Main navigation */}
          <nav className="p-2 space-y-0.5 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/emails' && pathname.startsWith(item.href))
              const Icon = item.icon
              
              const linkContent = (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] rounded-md transition-colors",
                    isActive 
                      ? "bg-[#f0f0f0] text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-[#f0f0f0]",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && item.label}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.href}>{linkContent}</div>
            })}
          </nav>
        </aside>

        {/* Invite Members Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            {isCheckingMemberLimit ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : memberLimitReached ? (
              <>
                <DialogHeader>
                  <DialogTitle>Invite team members</DialogTitle>
                  <DialogDescription>
                    Invite people to join your workspace.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-[15px] mb-2">Team member limit reached</h3>
                    <p className="text-muted-foreground text-[13px] mb-4">
                      Your {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan allows {TEAM_MEMBER_LIMITS[currentPlan]} team member{TEAM_MEMBER_LIMITS[currentPlan] === 1 ? '' : 's'}.
                      <br />
                      Upgrade to invite more members.
                    </p>
                    <Link href="/settings?tab=billing">
                      <Button className="text-[13px]">
                        <Crown className="w-3.5 h-3.5 mr-1.5" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
            <DialogHeader>
              <DialogTitle>Invite team members</DialogTitle>
              <DialogDescription>
                Invite people to join your workspace. They&apos;ll receive an email invitation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <p className="text-muted-foreground text-[11px]">
                {memberCount} of {TEAM_MEMBER_LIMITS[currentPlan] === -1 ? 'unlimited' : TEAM_MEMBER_LIMITS[currentPlan]} team members
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember} className="bg-stone-900 hover:bg-stone-800">
                Send invitation
              </Button>
            </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Manage Members Dialog */}
        <Dialog open={membersDialogOpen} onOpenChange={(open) => {
          setMembersDialogOpen(open)
          if (open) fetchMembers()
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Team members</DialogTitle>
              <DialogDescription>
                Manage who has access to this workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
              {isLoadingMembers ? (
                <div className="text-center py-8 text-[13px] text-muted-foreground">
                  Loading members...
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-muted-foreground">
                  <p>No members found.</p>
                  <Button 
                    variant="link" 
                    className="text-[13px] p-0 h-auto"
                    onClick={() => {
                      setMembersDialogOpen(false)
                      setInviteDialogOpen(true)
                    }}
                  >
                    Invite someone to join
                  </Button>
                </div>
              ) : (
                <>
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {member.user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={member.user.avatar_url} 
                            alt={member.user.email}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-xs">
                              {member.user.email?.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-medium">
                            {member.user.full_name || member.user.email}
                          </p>
                          <p className="text-[11px] text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.user.id === user.id && (
                          <span className="text-[11px] text-muted-foreground bg-stone-200 px-2 py-0.5 rounded">You</span>
                        )}
                        {member.role !== 'owner' && member.user.id !== user.id && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setMembersDialogOpen(false)
                        setInviteDialogOpen(true)
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite more members
                    </Button>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMembersDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Workspace Dialog */}
        <Dialog open={createWorkspaceOpen} onOpenChange={setCreateWorkspaceOpen}>
          <DialogContent className="sm:max-w-md">
            {isCheckingWorkspaceLimit ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : workspaceLimitReached ? (
              <>
                <DialogHeader>
                  <DialogTitle>Create new workspace</DialogTitle>
                  <DialogDescription>
                    Create a new workspace to organize your emails and team.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-[15px] mb-2">Workspace limit reached</h3>
                    <p className="text-muted-foreground text-[13px] mb-4">
                      Your {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan allows {WORKSPACE_LIMITS[currentPlan]} workspace{WORKSPACE_LIMITS[currentPlan] === 1 ? '' : 's'}.
                      <br />
                      Upgrade to create more workspaces.
                    </p>
                    <Link href="/settings?tab=billing">
                      <Button className="text-[13px]">
                        <Crown className="w-3.5 h-3.5 mr-1.5" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
            <DialogHeader>
              <DialogTitle>Create new workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your emails and team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Icon Upload */}
              <div className="space-y-2">
                <Label>Workspace icon</Label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:border-stone-400 transition-colors overflow-hidden bg-stone-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {workspaceIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={workspaceIcon} 
                        alt="Workspace icon" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-5 h-5 text-muted-foreground mx-auto" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload image
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Recommended: 256x256px, PNG or JPG
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleIconUpload}
                  />
                </div>
                {workspaceIcon && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-muted-foreground"
                    onClick={() => setWorkspaceIcon(null)}
                  >
                    Remove image
                  </Button>
                )}
              </div>

              {/* Workspace Name */}
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input
                  id="workspace-name"
                  placeholder="My Company"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  This is the name that will be displayed to your team.
                </p>
              </div>
              <p className="text-muted-foreground text-[11px]">
                {workspaces.length} of {WORKSPACE_LIMITS[currentPlan] === -1 ? 'unlimited' : WORKSPACE_LIMITS[currentPlan]} workspaces used
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCreateWorkspaceOpen(false)
                  setWorkspaceName('')
                  setWorkspaceIcon(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateWorkspace} 
                className="bg-stone-900 hover:bg-stone-800"
                disabled={isCreating || !workspaceName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create workspace'}
              </Button>
            </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  )
}
