'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, UserPlus, Trash2, Mail, Shield, Crown } from 'lucide-react'
import { toast } from 'sonner'

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

interface MembersSettingsProps {
  organizationId: string
  currentUserId: string
  userRole: 'owner' | 'admin' | 'member'
}

export function MembersSettings({ organizationId, currentUserId, userRole }: MembersSettingsProps) {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

  const canManage = userRole === 'owner' || userRole === 'admin'

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/v1/members?workspaceId=${organizationId}`)
        const result = await response.json()
        if (response.ok) {
          setMembers(result.data || [])
        }
      } catch {
        toast.error('Failed to load members')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [organizationId])

  const refetchMembers = async () => {
    try {
      const response = await fetch(`/api/v1/members?workspaceId=${organizationId}`)
      const result = await response.json()
      if (response.ok) {
        setMembers(result.data || [])
      }
    } catch {
      // Silent fail on refetch
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsInviting(true)
    try {
      const response = await fetch('/api/v1/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          workspaceId: organizationId,
          role: inviteRole,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite member')
      }

      toast.success(result.data.message)
      setInviteEmail('')
      setInviteDialogOpen(false)
      refetchMembers()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to invite member')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMemberId(memberId)
    try {
      const response = await fetch(`/api/v1/members?memberId=${memberId}&workspaceId=${organizationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to remove member')
      }

      toast.success('Member removed')
      refetchMembers()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setRemovingMemberId(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3.5 h-3.5 text-amber-500" />
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-blue-500" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Owner</Badge>
      case 'admin':
        return <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Admin</Badge>
      default:
        return <Badge variant="secondary" className="text-[10px]">Member</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with invite button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">
            {members.length} {members.length === 1 ? 'member' : 'members'} in this workspace
          </p>
        </div>
        {canManage && (
          <Button 
            size="sm"
            onClick={() => setInviteDialogOpen(true)}
            className="bg-stone-900 hover:bg-stone-800"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Members list */}
      <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3">
              {member.user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={member.user.avatar_url} 
                  alt={member.user.email}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {member.user.email?.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[14px]">
                    {member.user.full_name || member.user.email?.split('@')[0]}
                  </p>
                  {getRoleIcon(member.role)}
                  {member.user.id === currentUserId && (
                    <span className="text-[10px] text-muted-foreground bg-stone-100 px-1.5 py-0.5 rounded">You</span>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  {member.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getRoleBadge(member.role)}
              {canManage && member.role !== 'owner' && member.user.id !== currentUserId && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMemberId === member.id}
                >
                  {removingMemberId === member.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-[13px]">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'member')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <span>Member</span>
                      <span className="text-[11px] text-muted-foreground">- Can view and send emails</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <span>Admin</span>
                      <span className="text-[11px] text-muted-foreground">- Can manage workspace settings</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={isInviting || !inviteEmail.trim()}
              className="bg-stone-900 hover:bg-stone-800"
            >
              {isInviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
