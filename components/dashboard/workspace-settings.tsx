'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Loader2, Upload, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface WorkspaceSettingsProps {
  organization: {
    id: string
    name: string
    slug: string
    icon_url?: string | null
  }
  userRole: 'owner' | 'admin' | 'member'
}

export function WorkspaceSettings({ organization, userRole }: WorkspaceSettingsProps) {
  const router = useRouter()
  const [name, setName] = useState(organization.name)
  const [iconUrl, setIconUrl] = useState(organization.icon_url || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canEdit = userRole === 'owner' || userRole === 'admin'
  const canDelete = userRole === 'owner'

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      formData.append('workspaceId', organization.id)

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload')
      }

      setIconUrl(result.data.url)
      toast.success('Icon uploaded successfully')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload icon')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveIcon = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/workspaces/${organization.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon_url: null }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove icon')
      }

      setIconUrl(null)
      toast.success('Icon removed')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove icon')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmation !== organization.name) return
    
    setIsDeleting(true)
    try {
      const supabase = createClient()
      
      // Delete in order due to foreign key constraints
      // 1. Delete webhook logs
      await supabase.from('webhook_logs').delete().eq('webhook_id', 
        supabase.from('webhooks').select('id').eq('organization_id', organization.id)
      )
      
      // 2. Delete webhooks
      await supabase.from('webhooks').delete().eq('organization_id', organization.id)
      
      // 3. Delete email events
      await supabase.from('email_events').delete().eq('email_id',
        supabase.from('emails').select('id').eq('organization_id', organization.id)
      )
      
      // 4. Delete emails
      await supabase.from('emails').delete().eq('organization_id', organization.id)
      
      // 5. Delete contacts
      await supabase.from('contacts').delete().eq('audience_id',
        supabase.from('audiences').select('id').eq('organization_id', organization.id)
      )
      
      // 6. Delete audiences
      await supabase.from('audiences').delete().eq('organization_id', organization.id)
      
      // 7. Delete broadcasts
      await supabase.from('broadcasts').delete().eq('organization_id', organization.id)
      
      // 8. Delete templates
      await supabase.from('templates').delete().eq('organization_id', organization.id)
      
      // 9. Delete domains
      await supabase.from('domains').delete().eq('organization_id', organization.id)
      
      // 10. Delete API keys
      await supabase.from('api_keys').delete().eq('organization_id', organization.id)
      
      // 11. Delete organization members
      await supabase.from('organization_members').delete().eq('organization_id', organization.id)
      
      // 12. Delete the organization
      const { error } = await supabase.from('organizations').delete().eq('id', organization.id)
      
      if (error) throw error
      
      toast.success('Workspace deleted successfully')
      
      // Sign out and redirect to home
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete workspace. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Workspace name is required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/workspaces/${organization.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update workspace')
      }

      toast.success('Workspace updated successfully')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update workspace')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Workspace Icon */}
      <div className="space-y-3">
        <Label className="text-[13px]">Workspace Icon</Label>
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:border-stone-400 transition-colors overflow-hidden bg-stone-50"
            onClick={() => canEdit && fileInputRef.current?.click()}
          >
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={iconUrl} 
                alt="Workspace icon" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{organization.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            {canEdit && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                {iconUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRemoveIcon}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              Recommended: 256x256px, PNG or JPG
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleIconUpload}
          />
        </div>
      </div>

      {/* Workspace Name */}
      <div className="space-y-2">
        <Label htmlFor="workspace-name" className="text-[13px]">Workspace Name</Label>
        <Input
          id="workspace-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEdit}
          className="max-w-md"
        />
      </div>

      {/* Workspace Slug */}
      <div className="space-y-2">
        <Label className="text-[13px] text-muted-foreground">Workspace Slug</Label>
        <code className="block bg-stone-50 border border-stone-200/60 px-4 py-2.5 rounded-lg text-[13px] font-mono max-w-md">
          {organization.slug}
        </code>
        <p className="text-[11px] text-muted-foreground">
          The slug is auto-generated and cannot be changed.
        </p>
      </div>

      {/* Workspace ID */}
      <div className="space-y-2">
        <Label className="text-[13px] text-muted-foreground">Workspace ID</Label>
        <code className="block bg-stone-50 border border-stone-200/60 px-4 py-2.5 rounded-lg text-[12px] font-mono max-w-md break-all">
          {organization.id}
        </code>
      </div>

      {canEdit && (
        <Button 
          onClick={handleSave}
          disabled={isLoading || name === organization.name}
          className="bg-stone-900 hover:bg-stone-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      )}

      {/* Danger Zone */}
      {canDelete && (
        <div className="pt-8 mt-8 border-t border-stone-200">
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[15px] text-red-900">Danger Zone</h3>
                <p className="text-[13px] text-red-700 mt-1">
                  Deleting this workspace will permanently remove all associated data including emails, domains, API keys, and team members. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="mt-4"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-3">
                          <p>
                            This will permanently delete <strong>{organization.name}</strong> and all of its data:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>All emails and email logs</li>
                            <li>All domains and DNS records</li>
                            <li>All API keys</li>
                            <li>All webhooks</li>
                            <li>All templates and broadcasts</li>
                            <li>All team members will lose access</li>
                          </ul>
                          <p className="font-medium">
                            Type <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-900">{organization.name}</code> to confirm:
                          </p>
                          <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Type workspace name to confirm"
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
                        onClick={handleDeleteWorkspace}
                        disabled={deleteConfirmation !== organization.name || isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Workspace'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
