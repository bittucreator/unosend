'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Globe, Eye, CheckCircle, Clock, XCircle, RefreshCw, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { toast } from 'sonner'

interface DnsRecord {
  type: string
  name: string
  value: string
  status: string
}

interface Domain {
  id: string
  domain: string
  status: 'pending' | 'verified' | 'failed'
  dns_records: DnsRecord[]
  verified_at: string | null
  created_at: string
}

interface DomainsListProps {
  domains: Domain[]
  organizationId: string
}

export function DomainsList({ domains, organizationId }: DomainsListProps) {
  const router = useRouter()
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleVerify = async (id: string) => {
    setVerifyingId(id)
    
    try {
      const response = await fetch('/api/dashboard/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain_id: id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      if (data.verified) {
        toast.success('Domain verified successfully')
      } else {
        toast.info(data.message || 'DNS records not yet detected. Please wait for propagation.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to verify domain')
    }
    
    setVerifyingId(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('Failed to delete domain')
    } else {
      toast.success('Domain deleted')
    }
    
    setDeletingId(null)
    router.refresh()
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No domains yet</p>
        <p className="text-muted-foreground text-sm">Add a domain to start sending emails from your own address</p>
      </div>
    )
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-muted', label: 'Pending' },
    verified: { icon: CheckCircle, color: 'bg-muted', label: 'Verified' },
    failed: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Failed' },
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Added</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.map((domain) => {
          const status = statusConfig[domain.status]
          const StatusIcon = status.icon

          return (
            <TableRow key={domain.id}>
              <TableCell className="font-medium">{domain.domain}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(domain.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      DNS Records
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>DNS Records for {domain.domain}</DialogTitle>
                      <DialogDescription>
                        Add these DNS records to verify your domain
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {(domain.dns_records as DnsRecord[]).map((record, index) => (
                        <div key={index} className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">
                              {record.type}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Name: </span>
                              <code>{record.name}</code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Value: </span>
                              <code className="break-all">{record.value}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                
                {domain.status !== 'verified' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerify(domain.id)}
                    disabled={verifyingId === domain.id}
                  >
                    {verifyingId === domain.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Verify
                      </>
                    )}
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingId === domain.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{domain.domain}&quot;? This action cannot be undone
                        and you won&apos;t be able to send emails from this domain.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(domain.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
