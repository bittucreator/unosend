import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password - Unosend',
  description: 'Create a new password for your Unosend account',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Simple Header */}
      <div className="p-6">
        <Link href="/">
          <Image src="/Logo.svg" alt="Unosend" width={100} height={24} className="h-6 w-auto" />
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-[340px]">
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-stone-900">Create new password</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Enter your new password below
            </p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
