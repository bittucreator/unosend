import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Shield, 
  Code, 
  BarChart3, 
  Globe,
  Check,
  ArrowRight,
  Sparkles,
  Webhook
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Logo.svg" alt="Unosend" width={120} height={28} className="h-7 w-auto" />
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-[13px] text-muted-foreground hover:text-foreground transition">Features</Link>
              <Link href="#pricing" className="text-[13px] text-muted-foreground hover:text-foreground transition">Pricing</Link>
              <Link href="https://docs.unosend.com" className="text-[13px] text-muted-foreground hover:text-foreground transition">Docs</Link>
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

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 text-[12px] bg-stone-100 text-stone-600 border-0 px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1.5" />
            100K free emails every month
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-stone-900">
            One API. Infinite Emails.
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            The email API built for developers. Simple integration, 
            reliable delivery, and the best pricing in the industry.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link href="/signup">
              <Button size="sm" className="h-9 px-5 text-[13px]">
                Start for Free
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href="https://docs.unosend.com">
              <Button size="sm" variant="outline" className="h-9 px-5 text-[13px] border-stone-200/60">
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Code Example */}
          <div className="mt-14 max-w-xl mx-auto">
            <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden text-left shadow-sm">
              <div className="flex items-center px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                </div>
                <span className="ml-3 text-[12px] text-muted-foreground font-medium">send-email.ts</span>
              </div>
              <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed">
                <code className="text-stone-700">
{`await fetch('https://api.unosend.com/v1/emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer un_xxx...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Hello World',
    html: '<p>Welcome to Unosend!</p>'
  })
});`}
                </code>
              </pre>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div>
              <p className="text-2xl font-bold text-stone-900">99.9%</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Uptime</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">50ms</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Avg. Latency</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">10M+</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Emails Sent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[12px] text-muted-foreground mb-8 uppercase tracking-wider">
            Trusted by developers at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            <Image src="/Vercel.svg" alt="Vercel" width={80} height={20} className="h-5 w-auto opacity-60 hover:opacity-100 transition" />
            <Image src="/stripe.svg" alt="Stripe" width={60} height={20} className="h-5 w-auto opacity-60 hover:opacity-100 transition" />
            <Image src="/notion.svg" alt="Notion" width={80} height={20} className="h-5 w-auto opacity-60 hover:opacity-100 transition" />
            <Image src="/linear.svg" alt="Linear" width={70} height={20} className="h-5 w-auto opacity-60 hover:opacity-100 transition" />
            <Image src="/shopify.svg" alt="Shopify" width={80} height={20} className="h-5 w-auto opacity-60 hover:opacity-100 transition" />
            <Image src="/supabase.svg" alt="Supabase" width={100} height={20} className="h-5 w-auto opacity-60 hover:opacity-100 transition" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Everything you need to send emails
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              Built for developers who want a simple, reliable, and affordable email API.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Zap className="w-4 h-4" />}
              title="Lightning Fast"
              description="Send emails in milliseconds with our globally distributed infrastructure."
            />
            <FeatureCard
              icon={<Shield className="w-4 h-4" />}
              title="High Deliverability"
              description="Industry-leading deliverability with automatic IP warming."
            />
            <FeatureCard
              icon={<Code className="w-4 h-4" />}
              title="Developer First"
              description="Simple REST API with SDKs for all major languages."
            />
            <FeatureCard
              icon={<BarChart3 className="w-4 h-4" />}
              title="Real-time Analytics"
              description="Track opens, clicks, bounces with detailed insights."
            />
            <FeatureCard
              icon={<Globe className="w-4 h-4" />}
              title="Custom Domains"
              description="Send from your domain with easy DNS verification."
            />
            <FeatureCard
              icon={<Webhook className="w-4 h-4" />}
              title="Webhooks"
              description="Real-time notifications for all email events."
            />
          </div>
        </div>
      </section>

      {/* SDK/Integrations Section */}
      <section className="py-16 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Works with your stack
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              Official SDKs and integrations for all major languages and frameworks.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-3xl mx-auto">
            <IntegrationCard name="Node.js" />
            <IntegrationCard name="Python" />
            <IntegrationCard name="Go" />
            <IntegrationCard name="Ruby" />
            <IntegrationCard name="PHP" />
            <IntegrationCard name="Java" />
            <IntegrationCard name="Next.js" />
            <IntegrationCard name="React" />
            <IntegrationCard name="Vue" />
            <IntegrationCard name="Laravel" />
            <IntegrationCard name="Rails" />
            <IntegrationCard name="cURL" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Start sending in minutes
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              Get up and running with just a few lines of code.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <StepCard
              number="1"
              title="Create an account"
              description="Sign up for free and get your API key instantly."
            />
            <StepCard
              number="2"
              title="Verify your domain"
              description="Add DNS records to verify domain ownership."
            />
            <StepCard
              number="3"
              title="Send emails"
              description="Start sending emails with our simple API."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              description="Perfect for getting started"
              features={[
                '100,000 emails/month',
                '1 domain',
                'Email analytics',
                'API access',
                'Community support',
              ]}
            />
            <PricingCard
              name="Pro"
              price="$20"
              description="For growing businesses"
              features={[
                '500,000 emails/month',
                '10 domains',
                'Advanced analytics',
                'Webhooks',
                'Priority support',
              ]}
              popular
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large scale operations"
              features={[
                'Unlimited emails',
                'Unlimited domains',
                'Dedicated IPs',
                'SLA guarantee',
                '24/7 support',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Loved by developers
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              See what developers are saying about Unosend.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <TestimonialCard
              quote="Switched from SendGrid and cut our email costs by 70%. The API is incredibly simple to use."
              author="Sarah Chen"
              role="CTO"
              company="TechStartup"
            />
            <TestimonialCard
              quote="Best developer experience I've seen in an email API. Docs are great, support is fast."
              author="Marcus Johnson"
              role="Lead Developer"
              company="DevAgency"
            />
            <TestimonialCard
              quote="Finally, an email service that doesn't nickel and dime you. 100K free emails is incredible."
              author="Emily Rodriguez"
              role="Founder"
              company="SaaS.io"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              Everything you need to know about Unosend.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <FAQItem
              question="How does the free tier work?"
              answer="You get 100,000 emails per month for free, forever. No credit card required. Perfect for side projects and startups."
            />
            <FAQItem
              question="What's your deliverability rate?"
              answer="We maintain a 99%+ deliverability rate with automatic IP warming, dedicated IPs, and reputation monitoring."
            />
            <FAQItem
              question="Can I use my own domain?"
              answer="Yes! You can verify unlimited domains and send from any address. We handle DKIM, SPF, and DMARC setup automatically."
            />
            <FAQItem
              question="Do you offer dedicated IPs?"
              answer="Yes, dedicated IPs are available on our Enterprise plan. Contact sales to learn more about custom solutions."
            />
            <FAQItem
              question="What support do you offer?"
              answer="Free tier includes community support. Pro gets priority email support. Enterprise gets 24/7 dedicated support."
            />
            <FAQItem
              question="Can I migrate from another provider?"
              answer="Absolutely! Our API is designed to be a drop-in replacement. We also offer migration assistance for Enterprise customers."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-stone-200/60">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3 text-stone-900">
            Ready to start sending?
          </h2>
          <p className="text-muted-foreground text-[14px] mb-6">
            Join thousands of developers who trust Unosend for their email infrastructure.
          </p>
          <Link href="/signup">
            <Button size="sm" className="h-9 px-5 text-[13px]">
              Get Started for Free
              <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Logo.svg" alt="Unosend" width={100} height={24} className="h-6 w-auto" />
            </Link>
            <div className="flex items-center space-x-5 text-[13px] text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-5 bg-white border border-stone-200/60 rounded-xl hover:border-stone-300/60 transition">
      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[14px] font-semibold mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-[13px] leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-[13px] font-medium">
        {number}
      </div>
      <h3 className="text-[14px] font-semibold mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-[13px] leading-relaxed">{description}</p>
    </div>
  )
}

function PricingCard({ 
  name, 
  price, 
  description, 
  features, 
  popular = false 
}: { 
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
}) {
  return (
    <div className={`relative p-5 rounded-xl bg-white border ${popular ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200/60'}`}>
      {popular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="px-2.5 py-0.5 bg-stone-900 text-white text-[11px] font-medium rounded-full">
            Popular
          </span>
        </div>
      )}
      <div className="text-center mb-5">
        <h3 className="text-[14px] font-semibold mb-1">{name}</h3>
        <div className="text-2xl font-bold mb-1">
          {price}
          {price !== 'Custom' && <span className="text-[13px] font-normal text-muted-foreground">/mo</span>}
        </div>
        <p className="text-muted-foreground text-[12px]">{description}</p>
      </div>
      <ul className="space-y-2 mb-5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-[13px]">
            <Check className="w-3.5 h-3.5 mr-2 shrink-0 text-stone-500" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/signup" className="block">
        <Button 
          variant={popular ? "default" : "outline"} 
          size="sm"
          className={`w-full h-8 text-[13px] ${!popular ? 'border-stone-200/60' : ''}`}
        >
          {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
        </Button>
      </Link>
    </div>
  )
}

function IntegrationCard({ name }: { name: string }) {
  return (
    <div className="p-3 bg-white border border-stone-200/60 rounded-lg text-center hover:border-stone-300/60 transition">
      <span className="text-[13px] font-medium text-stone-700">{name}</span>
    </div>
  )
}

function TestimonialCard({ quote, author, role, company }: { quote: string; author: string; role: string; company: string }) {
  return (
    <div className="p-5 bg-white border border-stone-200/60 rounded-xl">
      <p className="text-[13px] text-stone-600 leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="text-[13px] font-semibold text-stone-900">{author}</p>
        <p className="text-[12px] text-muted-foreground">{role}, {company}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-4 bg-white border border-stone-200/60 rounded-xl">
      <h4 className="text-[14px] font-semibold text-stone-900 mb-2">{question}</h4>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  )
}
