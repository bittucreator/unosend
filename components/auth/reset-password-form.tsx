'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-[15px] font-semibold text-stone-900 mb-2">Password updated!</h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Your password has been reset successfully. Redirecting to login...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[13px] font-medium">
          New password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          className="h-[30px] text-[14px] border-stone-200"
        />
        <p className="text-[11px] text-muted-foreground">Must be at least 8 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[13px] font-medium">
          Confirm password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          className="h-[30px] text-[14px] border-stone-200"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full h-[30px] text-[14px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          'Reset password'
        )}
      </Button>
    </form>
  )
}
