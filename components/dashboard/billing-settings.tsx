'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Check, 
  Zap,
  Mail,
  Globe,
  Key,
  Users,
  ExternalLink
} from 'lucide-react'

interface BillingSettingsProps {
  organizationId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BillingSettings({ organizationId }: BillingSettingsProps) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '100,000 emails/month',
        '1 domain',
        'Unlimited API keys',
        'Email tracking',
        'Community support',
      ],
      current: true,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For growing businesses',
      features: [
        '500,000 emails/month',
        '10 domains',
        'Unlimited API keys',
        'Advanced analytics',
        'Webhooks',
        'Priority support',
        'Custom templates',
      ],
      current: false,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large scale operations',
      features: [
        'Unlimited emails',
        'Unlimited domains',
        'Dedicated IP',
        'SLA guarantee',
        'Custom integrations',
        '24/7 phone support',
        'Dedicated account manager',
      ],
      current: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Current Plan Banner */}
      <div className="border border-stone-200/60 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-[14px]">Current Plan</h3>
              <p className="text-[12px] text-muted-foreground">You&apos;re on the Free plan</p>
            </div>
          </div>
          <Badge className="text-[11px] bg-green-50 text-green-700 border-green-200">Active</Badge>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative border rounded-xl p-5 bg-white ${
              plan.current ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200'
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] bg-stone-900 text-white">
                Most Popular
              </Badge>
            )}
            
            <div className="mb-4">
              <h3 className="font-semibold text-[16px]">{plan.name}</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">{plan.description}</p>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-[13px] text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="space-y-2.5 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-[13px]">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              variant={plan.current ? "outline" : "default"}
              className={`w-full ${!plan.current ? 'bg-stone-900 hover:bg-stone-800' : ''}`}
              disabled={plan.current}
            >
              {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
            </Button>
          </div>
        ))}
      </div>

      {/* Plan Features Comparison */}
      <div className="border border-stone-200/60 rounded-xl overflow-hidden bg-white">
        <div className="p-5 border-b border-stone-100">
          <h3 className="font-semibold text-[15px]">Plan Features</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Compare what&apos;s included in each plan</p>
        </div>
        <div className="divide-y divide-stone-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px]">Monthly email limit</span>
            </div>
            <span className="text-[13px] font-medium">100,000</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px]">Custom domains</span>
            </div>
            <span className="text-[13px] font-medium">1</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px]">API keys</span>
            </div>
            <span className="text-[13px] font-medium">Unlimited</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px]">Team members</span>
            </div>
            <span className="text-[13px] font-medium">Unlimited</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border border-stone-200/60 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h3 className="font-medium text-[14px]">Payment Method</h3>
              <p className="text-[12px] text-muted-foreground">No payment method on file</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Billing History */}
      <div className="border border-stone-200/60 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-[14px]">Billing History</h3>
            <p className="text-[12px] text-muted-foreground">Download past invoices</p>
          </div>
          <Button variant="ghost" size="sm" className="text-[13px]">
            <ExternalLink className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
        <div className="text-center py-8 text-[13px] text-muted-foreground">
          No billing history yet
        </div>
      </div>
    </div>
  )
}
