import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Terms of Service</h1>
          <p className="text-[13px] text-muted-foreground mb-10">Last updated: November 28, 2025</p>

          <div className="prose prose-stone prose-sm max-w-none space-y-8">
            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">1. Agreement to Terms</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                By accessing or using Unosend&apos;s email API service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">2. Description of Service</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                Unosend provides an email API service that allows developers to send transactional and marketing emails programmatically. Our service includes email delivery, tracking, analytics, and related features.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">3. Account Registration</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-4">
                To use our service, you must:
              </p>
              <ul className="text-[14px] text-stone-600 space-y-2 list-disc list-inside">
                <li>Create an account with accurate and complete information</li>
                <li>Maintain the security of your API keys and credentials</li>
                <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                <li>Not share your account with others</li>
              </ul>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">4. Acceptable Use</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-4">
                You agree not to use our service to:
              </p>
              <ul className="text-[14px] text-stone-600 space-y-2 list-disc list-inside">
                <li>Send spam or unsolicited bulk emails</li>
                <li>Distribute malware, viruses, or harmful content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm others</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">5. Payment Terms</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                Paid plans are billed in advance on a monthly basis. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days notice.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">6. Service Level Agreement</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                We strive to maintain 99.9% uptime for our API. Enterprise customers receive a formal SLA with guaranteed uptime and credits for any outages. See our status page for real-time service status.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">7. Limitation of Liability</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                To the maximum extent permitted by law, Unosend shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">8. Termination</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">9. Changes to Terms</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will provide notice of significant changes via email or through our service. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h2 className="text-[16px] font-semibold text-stone-900 mb-3">10. Contact</h2>
              <p className="text-[14px] text-stone-600 leading-relaxed">
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@unosend.com" className="text-stone-900 underline">legal@unosend.com</a>.
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
              <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
              <Link href="/terms" className="text-foreground font-medium">Terms</Link>
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
