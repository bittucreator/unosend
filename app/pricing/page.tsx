import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IndiaPricingBanner } from '@/components/india-pricing-banner'
import { FAQSection } from '@/components/faq-section'
import { 
  Check, 
  X, 
  ArrowRight, 
  Zap, 
  Mail, 
  Users, 
  Globe, 
  BarChart3, 
  Headphones,
  Server,
  Code,
  Webhook,
  FileText,
  Key,
  Clock
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing - Unosend | Email API Pricing Plans',
  description: 'Simple, transparent pricing for Unosend email API. Start free with 5,000 emails/month. No hidden fees, no credit card required. Indian users get 50% off!',
  keywords: ['email api pricing', 'email service pricing', 'transactional email pricing', 'email api cost', 'unosend pricing', 'india email api'],
  openGraph: {
    title: 'Pricing - Unosend',
    description: 'Simple, transparent pricing. Start free with 5,000 emails/month.',
    url: 'https://unosend.com/pricing',
  },
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    emails: '5,000',
    contacts: '1,500',
    domains: '1',
    teamMembers: '1',
    dataRetention: '3 days',
    popular: false,
    cta: 'Get Started Free',
    ctaLink: '/signup',
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'For growing businesses',
    emails: '50,000',
    contacts: '10,000',
    domains: '10',
    teamMembers: '5',
    dataRetention: '7 days',
    popular: true,
    cta: 'Get Started',
    ctaLink: '/signup?plan=pro',
    overage: '$0.80 per 1,000 emails',
  },
  {
    name: 'Scale',
    price: '$100',
    period: '/month',
    description: 'For high-volume senders',
    emails: '200,000',
    contacts: '25,000',
    domains: 'Unlimited',
    teamMembers: 'Unlimited',
    dataRetention: '30 days',
    popular: false,
    cta: 'Get Started',
    ctaLink: '/signup?plan=scale',
    overage: '$0.80 per 1,000 emails',
  },
]

// Feature comparison based on actual app capabilities
const allFeatures = [
  {
    category: 'Email Sending',
    icon: <Mail className="w-4 h-4" />,
    features: [
      { name: 'Monthly email limit', free: '5,000', pro: '50,000', scale: '200,000', enterprise: 'Unlimited' },
      { name: 'Transactional emails', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Broadcast/Marketing emails', free: false, pro: true, scale: true, enterprise: true },
      { name: 'Email scheduling', free: false, pro: true, scale: true, enterprise: true },
      { name: 'HTML & text content', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Attachments support', free: true, pro: true, scale: true, enterprise: true },
    ],
  },
  {
    category: 'Contacts & Audiences',
    icon: <Users className="w-4 h-4" />,
    features: [
      { name: 'Contact limit', free: '1,500', pro: '10,000', scale: '25,000', enterprise: 'Unlimited' },
      { name: 'Audience lists', free: '1', pro: '10', scale: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Contact import (CSV)', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Contact export', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Unsubscribe management', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Contact metadata', free: true, pro: true, scale: true, enterprise: true },
    ],
  },
  {
    category: 'Domains',
    icon: <Globe className="w-4 h-4" />,
    features: [
      { name: 'Custom domains', free: '1', pro: '10', scale: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Domain verification', free: true, pro: true, scale: true, enterprise: true },
      { name: 'DKIM setup', free: true, pro: true, scale: true, enterprise: true },
      { name: 'SPF configuration', free: true, pro: true, scale: true, enterprise: true },
      { name: 'DMARC support', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Dedicated IP', free: false, pro: false, scale: 'Add-on $50/mo', enterprise: 'Included' },
    ],
  },
  {
    category: 'Analytics & Tracking',
    icon: <BarChart3 className="w-4 h-4" />,
    features: [
      { name: 'Delivery tracking', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Open tracking', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Click tracking', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Bounce tracking', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Real-time dashboard', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Advanced analytics', free: false, pro: true, scale: true, enterprise: true },
      { name: 'Data retention', free: '3 days', pro: '7 days', scale: '30 days', enterprise: '90 days' },
    ],
  },
  {
    category: 'API & Integrations',
    icon: <Code className="w-4 h-4" />,
    features: [
      { name: 'REST API access', free: true, pro: true, scale: true, enterprise: true },
      { name: 'API rate limit', free: '10 req/sec', pro: '100 req/sec', scale: '500 req/sec', enterprise: 'Custom' },
      { name: 'Webhooks', free: false, pro: true, scale: true, enterprise: true },
      { name: 'SDKs (Node, Python, Go, Ruby, PHP)', free: true, pro: true, scale: true, enterprise: true },
      { name: 'SMTP relay', free: true, pro: true, scale: true, enterprise: true },
      { name: 'API logs', free: true, pro: true, scale: true, enterprise: true },
    ],
  },
  {
    category: 'Templates',
    icon: <FileText className="w-4 h-4" />,
    features: [
      { name: 'Email templates', free: '5', pro: '50', scale: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'HTML editor', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Template variables', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Template versioning', free: false, pro: true, scale: true, enterprise: true },
    ],
  },
  {
    category: 'API Keys',
    icon: <Key className="w-4 h-4" />,
    features: [
      { name: 'API keys', free: '2', pro: '10', scale: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Key encryption (AES-256)', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Key expiration', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Key permissions', free: false, pro: true, scale: true, enterprise: true },
    ],
  },
  {
    category: 'Team & Collaboration',
    icon: <Users className="w-4 h-4" />,
    features: [
      { name: 'Team members', free: '1', pro: '5', scale: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Role-based access (Owner, Admin, Member)', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Team invitations', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Audit logs', free: false, pro: false, scale: true, enterprise: true },
    ],
  },
  {
    category: 'Support',
    icon: <Headphones className="w-4 h-4" />,
    features: [
      { name: 'Documentation', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Community support', free: true, pro: true, scale: true, enterprise: true },
      { name: 'Email support', free: false, pro: true, scale: true, enterprise: true },
      { name: 'Priority support', free: false, pro: true, scale: true, enterprise: true },
      { name: 'Phone support', free: false, pro: false, scale: false, enterprise: true },
      { name: 'SLA guarantee', free: false, pro: false, scale: '99.9%', enterprise: '99.99%' },
    ],
  },
]

const pricingFAQs = [
  {
    question: 'What counts as an email?',
    answer: 'Every email sent through our API counts as one email. If you send an email to 10 recipients in a single API call, that counts as 10 emails. CC and BCC recipients are also counted.',
  },
  {
    question: 'Do you offer regional pricing?',
    answer: 'Yes! We offer regional pricing for select countries. Users in eligible regions automatically get discounted pricing on Pro and Scale plans. The discount is applied automatically at checkout based on your location.',
  },
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time from your dashboard settings. When upgrading, the new limits take effect immediately. When downgrading, the change takes effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens if I exceed my monthly limit?',
    answer: 'We\'ll notify you when you reach 80% and 100% of your limit. If you exceed your limit, emails will be queued until your next billing cycle or until you upgrade. We never charge overage fees without your consent. Pro and Scale plans can enable overage billing at $0.80 per 1,000 emails.',
  },
  {
    question: 'Do unused emails roll over?',
    answer: 'No, unused emails do not roll over to the next month. Each billing cycle starts fresh with your plan\'s full allocation.',
  },
  {
    question: 'How does domain verification work?',
    answer: 'We provide DNS records (DKIM, SPF) that you add to your domain\'s DNS settings. Once added, we automatically verify them. This ensures high deliverability and prevents spoofing.',
  },
  {
    question: 'What\'s included in the Enterprise plan?',
    answer: 'Enterprise includes unlimited emails, unlimited contacts, unlimited domains, dedicated IP included, 99.99% SLA guarantee, 24/7 phone support, 90-day data retention, and a dedicated account manager. Contact sales for custom pricing.',
  },
  {
    question: 'Can I get a dedicated IP address?',
    answer: 'Dedicated IPs are available as an add-on for Scale plans at $50/month and are included free with Enterprise. Dedicated IPs help maintain your sender reputation independently from other senders.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through our payment processor. Enterprise customers can pay via invoice with NET 30 terms.',
  },
]

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-4 h-4 text-emerald-600" />
    ) : (
      <X className="w-4 h-4 text-stone-300" />
    )
  }
  return <span className="text-[13px] text-stone-700">{value}</span>
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Logo.svg" alt="Unosend" width={120} height={28} className="h-7 w-auto" />
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/#features" className="text-[13px] text-muted-foreground hover:text-foreground transition">Features</Link>
              <Link href="/pricing" className="text-[13px] text-foreground font-medium">Pricing</Link>
              <Link href="/docs" className="text-[13px] text-muted-foreground hover:text-foreground transition">Docs</Link>
              <Link href="/contact" className="text-[13px] text-muted-foreground hover:text-foreground transition">Contact</Link>
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
          <Badge variant="secondary" className="mb-4 text-[12px] bg-emerald-50 text-emerald-700 border-0 px-3 py-1">
            <Zap className="w-3 h-3 mr-1.5" />
            No credit card required
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-stone-900">
            Simple, transparent pricing
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-xl mx-auto mb-2">
            Start free with 5,000 emails/month. Scale as you grow.
          </p>
          <p className="text-[13px] text-muted-foreground">
            All plans include API access, email tracking, and verified domains.
          </p>
          <IndiaPricingBanner />
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 ${
                  plan.popular
                    ? 'border-stone-900 bg-stone-50/50'
                    : 'border-stone-200/60 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-stone-900 text-white text-[10px] px-2.5 py-0.5">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-[12px] text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-[13px]">{plan.period}</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-[13px]">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span><strong>{plan.emails}</strong> emails/month</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <Users className="w-4 h-4 text-stone-400" />
                    <span><strong>{plan.contacts}</strong> contacts</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <Globe className="w-4 h-4 text-stone-400" />
                    <span><strong>{plan.domains}</strong> {plan.domains === '1' ? 'domain' : 'domains'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <Users className="w-4 h-4 text-stone-400" />
                    <span><strong>{plan.teamMembers}</strong> team {plan.teamMembers === '1' ? 'member' : 'members'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span><strong>{plan.dataRetention}</strong> data retention</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <Webhook className="w-4 h-4 text-stone-400" />
                    <span>Webhooks {plan.name === 'Free' ? '(Pro+)' : '✓'}</span>
                  </div>
                </div>

                {plan.overage && (
                  <p className="text-[11px] text-muted-foreground mb-4 text-center">
                    Overage: {plan.overage}
                  </p>
                )}

                <Link href={plan.ctaLink}>
                  <Button
                    className={`w-full text-[13px] ${
                      plan.popular ? '' : 'bg-white text-stone-900 border border-stone-200 hover:bg-stone-50'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Enterprise */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-xl bg-stone-900 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-5 h-5" />
                    <h3 className="text-xl font-semibold">Enterprise</h3>
                  </div>
                  <p className="text-stone-300 text-[14px] mb-4">
                    For large scale operations with custom requirements
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                    <span className="text-[13px] flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited emails</span>
                    <span className="text-[13px] flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited contacts</span>
                    <span className="text-[13px] flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Dedicated IP included</span>
                    <span className="text-[13px] flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 99.99% SLA guarantee</span>
                    <span className="text-[13px] flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 24/7 phone support</span>
                    <span className="text-[13px] flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 90-day data retention</span>
                  </div>
                </div>
                <Link href="mailto:enterprise@unosend.com">
                  <Button variant="secondary" size="lg" className="whitespace-nowrap">
                    Contact Sales
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 border-t border-stone-200/60 bg-stone-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Compare all features
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              A detailed breakdown of everything included in each plan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-4 px-4 text-[13px] font-medium text-muted-foreground w-1/3">Feature</th>
                  <th className="text-center py-4 px-4 text-[13px] font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-[13px] font-semibold bg-stone-100 rounded-t-lg">Pro</th>
                  <th className="text-center py-4 px-4 text-[13px] font-semibold">Scale</th>
                  <th className="text-center py-4 px-4 text-[13px] font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((category, categoryIndex) => (
                  <>
                    <tr key={`category-${categoryIndex}`} className="bg-stone-100/50">
                      <td colSpan={5} className="py-3 px-4">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-stone-700">
                          {category.icon}
                          {category.category}
                        </div>
                      </td>
                    </tr>
                    {category.features.map((feature, featureIndex) => (
                      <tr key={`feature-${categoryIndex}-${featureIndex}`} className="border-b border-stone-100">
                        <td className="py-3 px-4 text-[13px] text-stone-600">{feature.name}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.free} />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center bg-stone-50">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.pro} />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.scale} />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.enterprise} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Breakdown */}
      <section className="py-16 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Cost breakdown
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              Understand exactly what you&apos;re paying for at each tier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl border border-stone-200/60 bg-white">
              <div className="text-center mb-4">
                <h3 className="font-semibold mb-1">Free</h3>
                <p className="text-3xl font-bold">$0</p>
                <p className="text-[11px] text-muted-foreground">per month</p>
              </div>
              <div className="space-y-2 text-[12px] text-stone-600">
                <div className="flex justify-between">
                  <span>5,000 emails</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per email</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>1,500 contacts</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>1 domain</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>API access</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border-2 border-stone-900 bg-stone-50/50">
              <div className="text-center mb-4">
                <Badge className="mb-2 bg-stone-900 text-white text-[10px]">Best Value</Badge>
                <h3 className="font-semibold mb-1">Pro</h3>
                <p className="text-3xl font-bold">$20</p>
                <p className="text-[11px] text-muted-foreground">per month</p>
              </div>
              <div className="space-y-2 text-[12px] text-stone-600">
                <div className="flex justify-between">
                  <span>50,000 emails</span>
                  <span>$20.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per email</span>
                  <span className="text-emerald-600 font-medium">$0.0004</span>
                </div>
                <div className="flex justify-between">
                  <span>10,000 contacts</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>10 domains</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Overage rate</span>
                  <span>$0.80/1K</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-stone-200/60 bg-white">
              <div className="text-center mb-4">
                <h3 className="font-semibold mb-1">Scale</h3>
                <p className="text-3xl font-bold">$100</p>
                <p className="text-[11px] text-muted-foreground">per month</p>
              </div>
              <div className="space-y-2 text-[12px] text-stone-600">
                <div className="flex justify-between">
                  <span>200,000 emails</span>
                  <span>$100.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per email</span>
                  <span className="text-emerald-600 font-medium">$0.0005</span>
                </div>
                <div className="flex justify-between">
                  <span>25,000 contacts</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Unlimited domains</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Dedicated IP</span>
                  <span>+$50/mo</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-stone-200/60 bg-stone-900 text-white">
              <div className="text-center mb-4">
                <h3 className="font-semibold mb-1">Enterprise</h3>
                <p className="text-3xl font-bold">Custom</p>
                <p className="text-[11px] text-stone-400">contact sales</p>
              </div>
              <div className="space-y-2 text-[12px] text-stone-300">
                <div className="flex justify-between">
                  <span>Unlimited emails</span>
                  <span className="text-emerald-400 font-medium">Custom</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume discounts</span>
                  <span className="text-emerald-400 font-medium">Available</span>
                </div>
                <div className="flex justify-between">
                  <span>Dedicated IP</span>
                  <span className="text-emerald-400 font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>SLA guarantee</span>
                  <span className="text-emerald-400 font-medium">99.99%</span>
                </div>
                <div className="flex justify-between">
                  <span>Data retention</span>
                  <span className="text-emerald-400 font-medium">90 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 border-t border-stone-200/60 bg-stone-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Optional add-on
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              Enhance your plan with additional features.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="p-6 rounded-xl border border-stone-200/60 bg-white">
              <Server className="w-8 h-8 text-stone-400 mb-4" />
              <h3 className="font-semibold mb-1">Dedicated IP</h3>
              <p className="text-[13px] text-muted-foreground mb-3">
                Maintain your own sender reputation with a dedicated IP address. Available for Scale plan.
              </p>
              <p className="text-2xl font-bold">$50<span className="text-[13px] font-normal text-muted-foreground">/month</span></p>
              <p className="text-[11px] text-emerald-600 mt-1">Included free with Enterprise</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-stone-900">
              Pricing FAQ
            </h2>
            <p className="text-muted-foreground text-[14px] max-w-lg mx-auto">
              Common questions about our pricing and plans.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <FAQSection faqs={pricingFAQs} />
          </div>
        </div>
      </section>

      {/* CTA */}
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
