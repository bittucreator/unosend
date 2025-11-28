import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Unosend Privacy Policy. Learn how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy - Unosend',
    description: 'Learn how we collect, use, and protect your personal information.',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Logo.svg" alt="Unosend" width={120} height={28} className="h-7 w-auto" />
            </Link>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 text-[13px]">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Privacy Policy</h1>
          <p className="text-[13px] text-muted-foreground mb-10">Last updated: November 28, 2025</p>

          <div className="prose prose-stone prose-sm max-w-none space-y-8">
            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">1. Introduction</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                Unosend (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our email API service.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">2. Information We Collect</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="text-[14px] text-stone-600 space-y-2 list-disc list-inside">
                <li>Account information (email address, name, company name)</li>
                <li>Payment information (processed securely via Stripe)</li>
                <li>Email content and metadata sent through our API</li>
                <li>Domain verification information</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">3. How We Use Your Information</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="text-[14px] text-stone-600 space-y-2 list-disc list-inside">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, investigate, and prevent fraudulent activities</li>
              </ul>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">4. Data Retention</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Email content is retained for 30 days for delivery tracking and debugging purposes.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">5. Data Security</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">6. Your Rights</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="text-[14px] text-stone-600 space-y-2 list-disc list-inside">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">7. Contact Us</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@unosend.com" className="text-stone-900 underline">privacy@unosend.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-stone-900 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">U</span>
              </div>
              <span className="text-[14px] font-semibold">Unosend</span>
            </div>
            <div className="flex items-center space-x-5 text-[13px] text-muted-foreground">
              <Link href="/privacy" className="text-foreground font-medium">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
              <Link href="/docs" className="hover:text-foreground transition">Docs</Link>
              <Link href="#" className="hover:text-foreground transition">Status</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-muted-foreground text-[12px]">
            © {new Date().getFullYear()} Unosend. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
