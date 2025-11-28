'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Mail, Key, Globe, Rocket } from 'lucide-react'

const steps = [
  {
    icon: Key,
    title: 'Create an API Key',
    description: 'Generate your first API key to start sending emails programmatically.',
  },
  {
    icon: Globe,
    title: 'Add a Domain',
    description: 'Verify your domain to improve deliverability and send from your own address.',
  },
  {
    icon: Mail,
    title: 'Send Your First Email',
    description: 'Use our API or SMTP to send your first transactional email.',
  },
]

export default function WelcomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [workspaceName, setWorkspaceName] = useState('')

  useEffect(() => {
    const fetchWorkspace = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Get organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organizations(name)')
        .eq('user_id', user.id)
        .single()
      
      if (!membership?.organizations) {
        router.push('/onboarding/workspace')
        return
      }
      
      const orgs = membership.organizations as unknown as { name: string }
      setWorkspaceName(orgs.name)
      setIsLoading(false)
    }
    
    fetchWorkspace()
  }, [router])

  const handleGetStarted = () => {
    router.push('/emails')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">
            Welcome to {workspaceName}!
          </h1>
          <p className="text-[14px] text-muted-foreground">
            Your workspace is ready. Here&apos;s how to get started with Unosend.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                <step.icon className="w-5 h-5 text-stone-600" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900 text-[14px]">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <span className="text-[12px] font-medium text-stone-400">
                  Step {index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleGetStarted}
          className="w-full h-11"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Go to Dashboard
        </Button>

        <p className="text-center text-[12px] text-muted-foreground mt-6">
          You can always access help from the sidebar or visit our{' '}
          <a href="/docs" className="text-stone-900 hover:underline">
            documentation
          </a>
          .
        </p>
      </div>
    </div>
  )
}
