'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

export default function UnsubscribePage() {
  const params = useParams()
  const token = params.token as string
  
  const [status, setStatus] = useState<'loading' | 'confirming' | 'success' | 'error' | 'already'>('loading')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Verify token and get email
    async function verifyToken() {
      try {
        const response = await fetch(`/api/v1/unsubscribe/verify?token=${token}`)
        const data = await response.json()
        
        if (!response.ok) {
          if (data.error === 'Already unsubscribed') {
            setStatus('already')
            setEmail(data.email || '')
          } else {
            setStatus('error')
            setError(data.error || 'Invalid or expired link')
          }
          return
        }
        
        setEmail(data.email)
        setStatus('confirming')
      } catch {
        setStatus('error')
        setError('Something went wrong')
      }
    }
    
    verifyToken()
  }, [token])

  const handleUnsubscribe = async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/v1/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unsubscribe')
      }
      
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
            <Mail className="w-6 h-6 text-stone-600" />
          </div>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Manage your email subscription</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-stone-400" />
              <p className="text-sm text-muted-foreground mt-2">Processing...</p>
            </div>
          )}
          
          {status === 'confirming' && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                You are about to unsubscribe <strong>{email}</strong> from our mailing list.
              </p>
              <Button onClick={handleUnsubscribe} className="w-full" variant="destructive">
                Unsubscribe
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You will no longer receive marketing emails from us.
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">Unsubscribed</h3>
              <p className="text-sm text-muted-foreground">
                <strong>{email}</strong> has been removed from our mailing list.
              </p>
            </div>
          )}
          
          {status === 'already' && (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">Already Unsubscribed</h3>
              <p className="text-sm text-muted-foreground">
                {email ? <><strong>{email}</strong> is</> : 'This email is'} already unsubscribed.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center py-4">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
