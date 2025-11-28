'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2, ArrowRight } from 'lucide-react'

export default function WorkspaceSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingOrg, setIsCheckingOrg] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const checkExistingOrg = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')
      
      // Check if user already has an organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()
      
      if (membership?.organization_id) {
        // User already has an org, redirect to dashboard
        router.push('/emails')
        return
      }
      
      // Suggest workspace name from email
      const emailPrefix = user.email?.split('@')[0] || ''
      const suggestedName = emailPrefix
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
      setWorkspaceName(suggestedName + "'s Workspace")
      
      setIsCheckingOrg(false)
    }
    
    checkExistingOrg()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!workspaceName.trim()) {
      setError('Please enter a workspace name')
      return
    }
    
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('Not authenticated')
      setIsLoading(false)
      return
    }

    // Generate slug from workspace name
    const slug = workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50) + '-' + user.id.substring(0, 8)

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: workspaceName.trim(),
        slug: slug,
        owner_id: user.id,
      })
      .select('id')
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError)
      setError(orgError.message || 'Failed to create workspace')
      setIsLoading(false)
      return
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      console.error('Error adding member:', memberError)
      setError(memberError.message || 'Failed to complete setup')
      setIsLoading(false)
      return
    }

    // Redirect to dashboard
    router.push('/emails')
  }

  if (isCheckingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-stone-600" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">
            Create your workspace
          </h1>
          <p className="text-[14px] text-muted-foreground">
            A workspace is where you manage your emails, domains, and API keys.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workspace" className="text-[13px]">Workspace name</Label>
            <Input
              id="workspace"
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="My Company"
              className="h-10"
              autoFocus
            />
            <p className="text-[12px] text-muted-foreground">
              You can always change this later in settings.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !workspaceName.trim()}
            className="w-full h-10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-[12px] text-muted-foreground mt-6">
          Signed in as {userEmail}
        </p>
      </div>
    </div>
  )
}
