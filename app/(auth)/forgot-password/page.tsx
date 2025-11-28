import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot Password - Unosend',
  description: 'Reset your Unosend password',
}

export default function ForgotPasswordPage() {
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
            <h1 className="text-xl font-semibold text-stone-900">Reset your password</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          <ForgotPasswordForm />

          <p className="text-center text-[13px] text-muted-foreground mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-stone-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
