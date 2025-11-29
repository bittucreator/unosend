'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Key, Trash2, Clock, Pencil, AlertCircle, Eye, Copy, Check } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

interface ApiKeysListProps {
  apiKeys: ApiKey[]
}

export function ApiKeysList({ apiKeys }: ApiKeysListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [viewingKey, setViewingKey] = useState<{ id: string; name: string; key: string } | null>(null)
  const [isLoadingKey, setIsLoadingKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleViewKey = async (apiKey: ApiKey) => {
    setIsLoadingKey(apiKey.id)
    
    try {
      const response = await fetch(`/api/dashboard/api-keys/${apiKey.id}/reveal`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to reveal API key')
      } else {
        setViewingKey({ id: apiKey.id, name: data.name, key: data.key })
      }
    } catch {
      toast.error('Failed to reveal API key')
    }

    setIsLoadingKey(null)
  }

  const handleCopyKey = async () => {
    if (viewingKey) {
      await navigator.clipboard.writeText(viewingKey.key)
      setCopied(true)
      toast.success('API key copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRevoke = async (id: string) => {
    setDeletingId(id)
    
    try {
      const response = await fetch(`/api/dashboard/api-keys/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to revoke API key')
      } else {
        toast.success('API key revoked successfully')
        router.refresh()
      }
    } catch {
      toast.error('Failed to revoke API key')
    }

    setDeletingId(null)
  }

  const handleEdit = (apiKey: ApiKey) => {
    setEditingKey(apiKey)
    setEditName(apiKey.name)
  }

  const handleSaveEdit = async () => {
    if (!editingKey || !editName.trim()) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/dashboard/api-keys/${editingKey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to update API key')
      } else {
        toast.success('API key updated successfully')
        router.refresh()
      }
    } catch {
      toast.error('Failed to update API key')
    }

    setIsSaving(false)
    setEditingKey(null)
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false
    const expDate = new Date(expiresAt)
    const now = new Date()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    return expDate > now && (expDate.getTime() - now.getTime()) < sevenDays
  }

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-12">
        <Key className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No API keys yet</p>
        <p className="text-muted-foreground text-sm">Create an API key to start sending emails</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-stone-50 hover:bg-stone-50">
            <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Name</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Key</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Last Used</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Expires</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Created</TableHead>
            <TableHead className="text-right text-[11px] uppercase tracking-wider text-stone-500 font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => {
            const expired = isExpired(apiKey.expires_at)
            const expiringSoon = isExpiringSoon(apiKey.expires_at)

            return (
              <TableRow key={apiKey.id} className={expired ? 'opacity-50' : ''}>
                <TableCell className="font-medium text-[13px]">
                  <div className="flex items-center gap-2">
                    {apiKey.name}
                    {expired && (
                      <Badge variant="destructive" className="text-[10px]">Expired</Badge>
                    )}
                    {expiringSoon && !expired && (
                      <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Expiring soon
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-muted-foreground bg-muted px-2 py-1 rounded text-[12px] font-mono">
                    {apiKey.key_prefix}...
                  </code>
                </TableCell>
                <TableCell className="text-muted-foreground text-[13px]">
                  {apiKey.last_used_at ? (
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {formatDistanceToNow(new Date(apiKey.last_used_at), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-stone-400">Never</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-[13px]">
                  {apiKey.expires_at ? (
                    <span title={format(new Date(apiKey.expires_at), 'PPpp')}>
                      {formatDistanceToNow(new Date(apiKey.expires_at), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-stone-400">Never</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-[13px]">
                  {formatDistanceToNow(new Date(apiKey.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleViewKey(apiKey)}
                      disabled={expired || isLoadingKey === apiKey.id}
                      title="View API key"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(apiKey)}
                      disabled={expired}
                      title="Rename"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          disabled={deletingId === apiKey.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke &quot;{apiKey.name}&quot;? This action cannot be undone
                            and any applications using this key will stop working.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevoke(apiKey.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke Key
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={!!editingKey} onOpenChange={(open) => !open && setEditingKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename API Key</DialogTitle>
            <DialogDescription>
              Update the name of your API key.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="API key name"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingKey(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editName.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Key Dialog */}
      <Dialog open={!!viewingKey} onOpenChange={(open) => { if (!open) { setViewingKey(null); setCopied(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key</DialogTitle>
            <DialogDescription>
              {viewingKey?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Input
                value={viewingKey?.key || ''}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyKey}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs mt-3">
              Keep this key secure. Do not share it publicly or commit it to version control.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => { setViewingKey(null); setCopied(false); }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
