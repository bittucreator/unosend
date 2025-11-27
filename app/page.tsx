import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  Zap, 
  Shield, 
  Code, 
  BarChart3, 
  Globe,
  Check,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">U</span>
              </div>
              <span className="text-xl font-semibold">Unosend</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition text-sm">Features</Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition text-sm">Pricing</Link>
              <Link href="#docs" className="text-muted-foreground hover:text-foreground transition text-sm">Docs</Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 py-1 border rounded-full mb-8 text-sm text-muted-foreground">
            Now with 100K free emails/month
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            One API. Infinite Emails.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            The #1 email API for developers. Simple, reliable, and affordable 
            with the highest limits in the industry.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">
                Start for Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="#docs">
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Code Example */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-card border rounded-lg overflow-hidden text-left">
              <div className="flex items-center px-4 py-3 border-b bg-muted/50">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
                </div>
                <span className="ml-4 text-sm text-muted-foreground">send-email.ts</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-foreground">
{`await fetch('https://api.unosend.co/v1/emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer un_xxx...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Hello World',
    html: '<p>Welcome!</p>'
  })
});`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to send emails
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for developers who want a simple, reliable, and affordable email API.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Lightning Fast"
              description="Send emails in milliseconds. Our infrastructure is optimized for speed and reliability."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="High Deliverability"
              description="Industry-leading deliverability rates with automatic IP warming and reputation monitoring."
            />
            <FeatureCard
              icon={<Code className="w-5 h-5" />}
              title="Developer First"
              description="Simple REST API with SDKs for all major languages. Ship in minutes, not days."
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Real-time Analytics"
              description="Track opens, clicks, bounces, and more. Get detailed insights into your email performance."
            />
            <FeatureCard
              icon={<Globe className="w-5 h-5" />}
              title="Custom Domains"
              description="Send from your own domain with easy DNS verification and automatic DKIM/SPF setup."
            />
            <FeatureCard
              icon={<Mail className="w-5 h-5" />}
              title="Webhooks"
              description="Get real-time notifications for email events. Integrate with your existing workflows."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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

      {/* CTA Section */}
      <section className="py-20 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to start sending?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of developers who trust MailSend for their email infrastructure.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Get Started for Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-semibold">MailSend</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition">Terms</Link>
              <Link href="#" className="hover:text-foreground transition">Docs</Link>
              <Link href="#" className="hover:text-foreground transition">Status</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} MailSend. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 border rounded-lg hover:bg-muted/50 transition">
      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
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
    <div className={`relative p-6 rounded-lg border ${popular ? 'border-foreground' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-foreground text-background text-xs font-medium rounded-full">
            Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        <div className="text-3xl font-bold mb-1">
          {price}
          {price !== 'Custom' && <span className="text-base font-normal text-muted-foreground">/mo</span>}
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm">
            <Check className="w-4 h-4 mr-2 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/signup" className="block">
        <Button variant={popular ? "default" : "outline"} className="w-full">
          {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
        </Button>
      </Link>
    </div>
  )
}
