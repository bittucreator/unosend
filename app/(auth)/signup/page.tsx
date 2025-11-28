import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up - Unosend',
  description: 'Create your Unosend account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-5">
          <Link href="/" className="inline-block">
            <Image 
              src="/Logo.svg" 
              alt="Unosend" 
              width={130} 
              height={30} 
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-stone-900">Create your account</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Start sending emails in under 5 minutes
          </p>
        </div>

        <div className="bg-white border border-stone-200/60 rounded-2xl p-6 sm:p-8 shadow-sm">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
            </div>
          }>
            <SignupForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-stone-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
