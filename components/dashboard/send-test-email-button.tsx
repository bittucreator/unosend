'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SendTestEmailButtonProps {
  type: 'template' | 'broadcast'
  id: string
  disabled?: boolean
}

export function SendTestEmailButton({ type, id, disabled }: SendTestEmailButtonProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/v1/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          id,
          testEmail: email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }

      setSent(true)
      toast.success(`Test email sent to ${email}`)
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSent(false)
        setOpen(false)
        setEmail('')
      }, 2000)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-[13px]" disabled={disabled}>
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Send Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a preview of this {type} to your email address.
          </DialogDescription>
        </DialogHeader>
        
        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium">Test email sent!</p>
            <p className="text-sm text-muted-foreground mt-1">Check your inbox at {email}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="testEmail">Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The email will include a [TEST] prefix and test banner.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={loading || !email}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Test
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
