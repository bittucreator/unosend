import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - Unosend',
  description: 'Get in touch with the Unosend team. We\'re here to help with sales inquiries, support questions, and partnership opportunities.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Logo.svg" alt="Unosend" width={120} height={28} className="h-7 w-auto" />
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/#features" className="text-[13px] text-muted-foreground hover:text-foreground transition">Features</Link>
              <Link href="/#pricing" className="text-[13px] text-muted-foreground hover:text-foreground transition">Pricing</Link>
              <Link href="/docs" className="text-[13px] text-muted-foreground hover:text-foreground transition">Docs</Link>
              <Link href="/contact" className="text-[13px] text-foreground font-medium transition">Contact</Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 text-[13px]">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="h-8 text-[13px]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-stone-900">
            Get in touch
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have questions about Unosend? We&apos;re here to help. Reach out to our team and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Sales */}
            <div className="p-6 bg-white border border-stone-200/60 rounded-xl">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5 text-stone-600" />
              </div>
              <h3 className="text-[15px] font-semibold mb-2">Sales</h3>
              <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
                Interested in our Enterprise plan or have questions about pricing? Talk to our sales team.
              </p>
              <Link href="mailto:sales@unosend.co">
                <Button variant="outline" size="sm" className="h-8 text-[13px] border-stone-200/60">
                  sales@unosend.co
                </Button>
              </Link>
            </div>

            {/* Support */}
            <div className="p-6 bg-white border border-stone-200/60 rounded-xl">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-stone-600" />
              </div>
              <h3 className="text-[15px] font-semibold mb-2">Support</h3>
              <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
                Need help with your account or have a technical question? Our support team is ready to assist.
              </p>
              <Link href="mailto:support@unosend.co">
                <Button variant="outline" size="sm" className="h-8 text-[13px] border-stone-200/60">
                  support@unosend.co
                </Button>
              </Link>
            </div>

            {/* General */}
            <div className="p-6 bg-white border border-stone-200/60 rounded-xl">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-stone-600" />
              </div>
              <h3 className="text-[15px] font-semibold mb-2">General Inquiries</h3>
              <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
                For partnerships, press inquiries, or anything else, reach out to our general inbox.
              </p>
              <Link href="mailto:hello@unosend.co">
                <Button variant="outline" size="sm" className="h-8 text-[13px] border-stone-200/60">
                  support@unosend.co
                </Button>
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="p-6 bg-stone-50 border border-stone-200/60 rounded-xl text-center">
              <h3 className="text-[15px] font-semibold mb-3">Response Times</h3>
              <div className="grid md:grid-cols-3 gap-4 text-[13px]">
                <div>
                  <p className="font-medium text-stone-900">Free Plan</p>
                  <p className="text-muted-foreground">Community support via docs</p>
                </div>
                <div>
                  <p className="font-medium text-stone-900">Pro Plan</p>
                  <p className="text-muted-foreground">Priority email support, 24hr response</p>
                </div>
                <div>
                  <p className="font-medium text-stone-900">Enterprise</p>
                  <p className="text-muted-foreground">24/7 dedicated support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-stone-200/60 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Logomark - dark.svg" alt="Unosend" width={28} height={28} className="h-7 w-auto" />
            </Link>
            <div className="flex items-center space-x-5 text-[13px] text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
              <Link href="/docs" className="hover:text-foreground transition">Docs</Link>
              <Link href="/contact" className="hover:text-foreground transition">Contact</Link>
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
