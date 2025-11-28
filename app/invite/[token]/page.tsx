import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import { AcceptInviteButton } from './accept-invite-button'

export const metadata: Metadata = {
  title: 'Accept Invitation - Unosend',
  description: 'Accept your workspace invitation',
}

interface Props {
  params: Promise<{ token: string }>
}

export default async function AcceptInvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get invitation details
  const { data: invitation } = await supabaseAdmin
    .from('invitations')
    .select(`
      id,
      email,
      role,
      expires_at,
      accepted_at,
      organizations (
        id,
        name
      )
    `)
    .eq('token', token)
    .single()

  if (!invitation) {
    notFound()
  }

  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] text-center">
          <Link href="/" className="inline-block mb-8">
            <Image src="/Logo.svg" alt="Unosend" width={130} height={30} className="h-8 w-auto" />
          </Link>
          <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-stone-900 mb-2">Invitation Expired</h1>
            <p className="text-[14px] text-muted-foreground mb-6">
              This invitation has expired. Please ask the workspace admin to send a new invitation.
            </p>
            <Link href="/login" className="text-[14px] text-stone-900 font-medium hover:underline">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if invitation is already accepted
  if (invitation.accepted_at) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] text-center">
          <Link href="/" className="inline-block mb-8">
            <Image src="/Logo.svg" alt="Unosend" width={130} height={30} className="h-8 w-auto" />
          </Link>
          <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-stone-900 mb-2">Already Accepted</h1>
            <p className="text-[14px] text-muted-foreground mb-6">
              This invitation has already been accepted.
            </p>
            <Link href="/dashboard" className="text-[14px] text-stone-900 font-medium hover:underline">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const org = Array.isArray(invitation.organizations) 
    ? invitation.organizations[0] 
    : invitation.organizations

  // If user is logged in
  if (user) {
    // Check if email matches
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
          <div className="w-full max-w-[400px] text-center">
            <Link href="/" className="inline-block mb-8">
              <Image src="/Logo.svg" alt="Unosend" width={130} height={30} className="h-8 w-auto" />
            </Link>
            <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
              <h1 className="text-xl font-semibold text-stone-900 mb-2">Wrong Account</h1>
              <p className="text-[14px] text-muted-foreground mb-2">
                This invitation was sent to <strong>{invitation.email}</strong>.
              </p>
              <p className="text-[14px] text-muted-foreground mb-6">
                You are logged in as <strong>{user.email}</strong>.
              </p>
              <p className="text-[13px] text-muted-foreground">
                Please log out and sign in with the correct account, or sign up with the invited email.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // User is logged in with correct email - show accept button
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] text-center">
          <Link href="/" className="inline-block mb-8">
            <Image src="/Logo.svg" alt="Unosend" width={130} height={30} className="h-8 w-auto" />
          </Link>
          <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-stone-900 mb-2">Workspace Invitation</h1>
            <p className="text-[14px] text-muted-foreground mb-6">
              You&apos;ve been invited to join <strong>{org?.name || 'a workspace'}</strong> as a{' '}
              <strong>{invitation.role}</strong>.
            </p>
            <AcceptInviteButton token={token} />
          </div>
        </div>
      </div>
    )
  }

  // User is not logged in - redirect to signup with invitation context
  redirect(`/signup?invite=${token}&email=${encodeURIComponent(invitation.email)}`)
}
