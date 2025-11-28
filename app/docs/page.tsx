import { Metadata } from 'next'
import Link from 'next/link'
import { CodeBlock } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Mail, 
  Globe, 
  Key, 
  Webhook,
  Zap,
  Shield,
  Code
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Learn how to integrate Unosend email API into your application. Comprehensive guides, API reference, and code examples.',
  openGraph: {
    title: 'Unosend Documentation',
    description: 'Learn how to integrate Unosend email API into your application.',
  },
}

export default function DocsPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-green-50 text-green-700 border-0">
          v1.0
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Unosend Documentation</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Welcome to the Unosend documentation. Learn how to integrate our email API 
          into your applications and start sending emails in minutes.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <QuickLink
          icon={<Zap className="w-4 h-4" />}
          title="Quick Start"
          description="Get up and running in 5 minutes"
          href="/docs/quickstart"
        />
        <QuickLink
          icon={<Mail className="w-4 h-4" />}
          title="Send Your First Email"
          description="Learn the basics of sending emails"
          href="/docs/api/emails"
        />
        <QuickLink
          icon={<Globe className="w-4 h-4" />}
          title="Domain Setup"
          description="Verify your sending domain"
          href="/docs/guides/domain-verification"
        />
        <QuickLink
          icon={<Code className="w-4 h-4" />}
          title="SDKs & Libraries"
          description="Official SDKs for all languages"
          href="/docs/sdks/nodejs"
        />
      </div>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Installation</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Install the Unosend SDK for your preferred language:
        </p>
        
        <div className="space-y-3">
          <CodeBlock 
            code="npm install @unosend/node" 
            filename="Node.js"
          />
          <CodeBlock 
            code="pip install unosend" 
            filename="Python"
          />
          <CodeBlock 
            code="go get github.com/unosend/unosend-go" 
            filename="Go"
          />
        </div>
      </section>

      {/* Quick Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Quick Example</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Send your first email with just a few lines of code:
        </p>
        
        <CodeBlock 
          filename="send-email.ts"
          showLineNumbers
          code={`import { Unosend } from '@unosend/node';

const unosend = new Unosend('un_your_api_key');

const { data, error } = await unosend.emails.send({
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Welcome to Unosend!',
  html: '<h1>Hello World</h1><p>Welcome to Unosend!</p>'
});

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Email sent!', data.id);
}`}
        />
      </section>

      {/* API Overview */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">API Overview</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Unosend provides a simple REST API for all email operations:
        </p>
        
        <div className="space-y-3">
          <APICard
            method="POST"
            endpoint="/v1/emails"
            description="Send an email"
          />
          <APICard
            method="GET"
            endpoint="/v1/emails/:id"
            description="Get email details"
          />
          <APICard
            method="POST"
            endpoint="/v1/domains"
            description="Add a domain"
          />
          <APICard
            method="GET"
            endpoint="/v1/domains/:id/verify"
            description="Verify domain DNS"
          />
          <APICard
            method="POST"
            endpoint="/v1/webhooks"
            description="Create a webhook"
          />
        </div>
      </section>

      {/* Base URL */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Base URL</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          All API requests should be made to:
        </p>
        <CodeBlock code="https://api.unosend.com/v1" />
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<Zap className="w-4 h-4" />}
            title="Fast Delivery"
            description="Emails delivered in milliseconds with global infrastructure"
          />
          <FeatureCard
            icon={<Shield className="w-4 h-4" />}
            title="High Deliverability"
            description="99%+ inbox placement with automatic IP warming"
          />
          <FeatureCard
            icon={<Webhook className="w-4 h-4" />}
            title="Real-time Webhooks"
            description="Get instant notifications for all email events"
          />
          <FeatureCard
            icon={<Key className="w-4 h-4" />}
            title="Secure by Default"
            description="API keys, DKIM, SPF, and DMARC built-in"
          />
        </div>
      </section>
    </div>
  )
}

function QuickLink({ icon, title, description, href }: { 
  icon: React.ReactNode
  title: string
  description: string
  href: string 
}) {
  return (
    <Link 
      href={href}
      className="flex items-start gap-3 p-4 bg-white border border-stone-200/60 rounded-xl hover:border-stone-300/60 hover:shadow-sm transition group"
    >
      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-stone-200/70 transition">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-stone-900 mb-0.5">{title}</h3>
        <p className="text-[13px] text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition shrink-0 mt-1" />
    </Link>
  )
}

function APICard({ method, endpoint, description }: {
  method: string
  endpoint: string
  description: string
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-50 text-green-700',
    POST: 'bg-blue-50 text-blue-700',
    PUT: 'bg-yellow-50 text-yellow-700',
    PATCH: 'bg-orange-50 text-orange-700',
    DELETE: 'bg-red-50 text-red-700',
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-stone-200/60 rounded-lg">
      <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${methodColors[method]}`}>
        {method}
      </span>
      <code className="text-[13px] text-stone-700 font-mono flex-1">{endpoint}</code>
      <span className="text-[12px] text-muted-foreground hidden sm:block">{description}</span>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-4 bg-white border border-stone-200/60 rounded-xl">
      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[14px] font-semibold text-stone-900 mb-1">{title}</h3>
      <p className="text-[13px] text-muted-foreground">{description}</p>
    </div>
  )
}
