'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface SettingsFormProps {
  profile: Profile | null
  organization: { id: string; name: string; slug: string } | null
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  
  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Account deletion state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const response = await fetch('/api/dashboard/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload')
      }

      setAvatarUrl(result.data.url)
      toast.success('Avatar uploaded successfully')
      router.refresh()
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  // Remove avatar
  const handleRemoveAvatar = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile?.id)
      
      if (error) throw error
      
      setAvatarUrl(null)
      toast.success('Avatar removed')
      router.refresh()
    } catch {
      toast.error('Failed to remove avatar')
    } finally {
      setIsLoading(false)
    }
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile?.id)

      if (error) throw error
      
      toast.success('Profile updated successfully')
      router.refresh()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Change email
  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a new email address')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setIsChangingEmail(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })
      
      if (error) throw error
      
      toast.success('Verification email sent to your new address. Please check your inbox.')
      setNewEmail('')
    } catch (err) {
      console.error('Email change error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to change email')
    } finally {
      setIsChangingEmail(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setIsChangingPassword(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (error) throw error
      
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return
    
    setIsDeleting(true)
    try {
      const supabase = createClient()
      
      // Get user's organizations where they are owner
      const { data: ownedOrgs } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', profile?.id)
      
      // Delete all owned organizations and their data
      if (ownedOrgs) {
        for (const org of ownedOrgs) {
          // Delete org data
          await supabase.from('webhooks').delete().eq('organization_id', org.id)
          await supabase.from('emails').delete().eq('organization_id', org.id)
          await supabase.from('domains').delete().eq('organization_id', org.id)
          await supabase.from('api_keys').delete().eq('organization_id', org.id)
          await supabase.from('templates').delete().eq('organization_id', org.id)
          await supabase.from('broadcasts').delete().eq('organization_id', org.id)
          await supabase.from('organization_members').delete().eq('organization_id', org.id)
          await supabase.from('organizations').delete().eq('id', org.id)
        }
      }
      
      // Remove from other organizations
      await supabase
        .from('organization_members')
        .delete()
        .eq('user_id', profile?.id)
      
      // Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', profile?.id)
      
      // Note: Deleting from auth.users requires admin/service role
      // The user will be orphaned but can't log in after profile deletion
      
      toast.success('Account deleted successfully')
      
      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Failed to delete account. Please contact support.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-0">
      {/* Profile Picture Row */}
      <div className="flex items-center justify-between py-6 border-b border-stone-200">
        <div>
          <p className="font-medium text-[14px]">Profile Picture</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">How you&apos;re shown around the app</p>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center cursor-pointer hover:border-stone-300 transition-colors overflow-hidden bg-stone-50 relative"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
            ) : avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-stone-500 font-semibold text-sm">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
              </span>
            )}
          </div>
          {avatarUrl && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={isLoading || isUploading}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
      </div>

      {/* Full Name Row */}
      <div className="flex items-center justify-between py-6 border-b border-stone-200">
        <div>
          <p className="font-medium text-[14px]">Full Name</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">This is your display name</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-48 bg-stone-50 border-stone-200"
            placeholder="Your name"
          />
          {fullName !== (profile?.full_name || '') && (
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {/* Email Row */}
      <div className="flex items-center justify-between py-6 border-b border-stone-200">
        <div>
          <p className="font-medium text-[14px]">Email Address</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">Change your account email</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-56 bg-stone-50 border-stone-200"
            placeholder="new@example.com"
          />
          {newEmail.trim() && (
            <Button
              onClick={handleChangeEmail}
              disabled={isChangingEmail}
              size="sm"
            >
              {isChangingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
            </Button>
          )}
        </div>
      </div>

      {/* Password Section */}
      <div className="py-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[14px]">Password</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Update your password</p>
          </div>
        </div>
        <div className="mt-4 space-y-3 max-w-sm">
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-stone-50 border-stone-200"
            placeholder="New password"
          />
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-stone-50 border-stone-200"
            placeholder="Confirm new password"
          />
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !newPassword || !confirmPassword}
            size="sm"
          >
            {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[14px] text-red-600">Delete Account</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Permanently delete your account and all data</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      This will permanently delete your account and:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>All workspaces you own</li>
                      <li>All emails and email logs</li>
                      <li>All domains and DNS records</li>
                      <li>All API keys and webhooks</li>
                      <li>All templates and broadcasts</li>
                      <li>Your profile and settings</li>
                    </ul>
                    <p className="font-medium">
                      Type <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-900">DELETE</code> to confirm:
                    </p>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="mt-2"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
