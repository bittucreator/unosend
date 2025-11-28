'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AcceptInviteButtonProps {
  token: string
}

export function AcceptInviteButton({ token }: AcceptInviteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()

  const handleAccept = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setAccepted(true)
      toast.success('Invitation accepted!')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation')
    } finally {
      setLoading(false)
    }
  }

  if (accepted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <p className="text-[14px] text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <Button onClick={handleAccept} disabled={loading} className="w-full">
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      Accept Invitation
    </Button>
  )
}
