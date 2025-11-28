'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  CreditCard, 
  Check, 
  Zap,
  Mail,
  Globe,
  Key,
  Users,
  ExternalLink,
  Loader2,
  AlertCircle,
  MapPin
} from 'lucide-react'

interface BillingSettingsProps {
  organizationId: string
}

interface Subscription {
  id: string
  plan: string
  status: string
  dodo_customer_id: string | null
  dodo_subscription_id: string | null
  dodo_product_id: string | null
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

interface Usage {
  emails_sent: number
  emails_limit: number
  contacts_count?: number
  contacts_limit?: number
}

interface Invoice {
  id: string
  dodo_payment_id: string
  amount_paid: number
  currency: string
  status: string
  invoice_url: string | null
  paid_at: string
  created_at: string
}

interface BillingData {
  subscription: Subscription | null
  usage: Usage
  invoices: Invoice[]
}

// Detect if user is from India based on timezone or locale
const isIndianUser = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return timezone.includes('Kolkata') || timezone.includes('Asia/Calcutta')
  } catch {
    return false
  }
}

const getPlans = (isIndia: boolean) => [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceValue: 0,
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '5,000 emails/month',
      '1,500 contacts',
      '1 domain',
      'API access',
      'Email tracking',
      '3-day data retention',
    ],
    limits: { emails: 5000, contacts: 1500, domains: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: isIndia ? '$10' : '$20',
    priceValue: isIndia ? 10 : 20,
    period: '/month',
    description: 'For growing businesses',
    features: [
      '50,000 emails/month',
      '10,000 contacts',
      '10 domains',
      'Advanced analytics',
      'Webhooks',
      'Priority support',
      '7-day data retention',
    ],
    limits: { emails: 50000, contacts: 10000, domains: 10 },
    popular: true,
    overage: '$0.80 per 1,000 emails',
  },
  {
    id: 'scale',
    name: 'Scale',
    price: isIndia ? '$50' : '$100',
    priceValue: isIndia ? 50 : 100,
    period: '/month',
    description: 'For high-volume senders',
    features: [
      '200,000 emails/month',
      '25,000 contacts',
      'Unlimited domains',
      'Unlimited team members',
      'Dedicated IP (add-on)',
      '30-day data retention',
    ],
    limits: { emails: 200000, contacts: 25000, domains: -1 },
    overage: '$0.80 per 1,000 emails',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceValue: -1,
    period: '',
    description: 'For large scale operations',
    features: [
      'Unlimited emails',
      'Unlimited contacts',
      'Unlimited domains',
      'Dedicated IP included',
      'SLA guarantee',
      '24/7 phone support',
      '90-day data retention',
    ],
    limits: { emails: -1, contacts: -1, domains: -1 },
  },
]

export function BillingSettings({ organizationId }: BillingSettingsProps) {
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [currentPlanName, setCurrentPlanName] = useState('Free')
  const [isIndia, setIsIndia] = useState(false)

  useEffect(() => {
    setIsIndia(isIndianUser())
  }, [])

  const PLANS = getPlans(isIndia)

  const fetchBillingData = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/billing?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        setBillingData(data)
        // Determine current plan name from subscription
        if (data.subscription?.plan) {
          const planMapping: Record<string, string> = {
            'free': 'Free',
            'pro': 'Pro',
            'scale': 'Scale',
            'enterprise': 'Enterprise',
          }
          setCurrentPlanName(planMapping[data.subscription.plan] || 'Free')
        }
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchBillingData()
  }, [fetchBillingData])

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@unosend.com?subject=Enterprise%20Plan%20Inquiry'
      return
    }

    setUpgrading(planId)
    try {
      // Get product ID for the selected plan (India vs Global)
      const productIds: Record<string, string> = isIndia ? {
        pro: process.env.NEXT_PUBLIC_DODO_PRO_INDIA_PRODUCT_ID || 'pro_india_product',
        scale: process.env.NEXT_PUBLIC_DODO_SCALE_INDIA_PRODUCT_ID || 'scale_india_product',
      } : {
        pro: process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID || 'pro_product',
        scale: process.env.NEXT_PUBLIC_DODO_SCALE_PRODUCT_ID || 'scale_product',
      }

      const productId = productIds[planId]
      if (!productId) {
        toast.error('Invalid plan selected')
        return
      }

      // Redirect to Dodo Payments checkout
      const checkoutUrl = `/api/checkout?productId=${productId}&quantity=1&metadata[workspace_id]=${organizationId}&metadata[plan]=${planId}&metadata[region]=${isIndia ? 'india' : 'global'}`
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to start upgrade process')
    } finally {
      setUpgrading(null)
    }
  }

  const handleManageBilling = async () => {
    if (!billingData?.subscription?.dodo_customer_id) {
      toast.error('No billing account found')
      return
    }

    try {
      // Redirect to Dodo Payments customer portal
      const portalUrl = `/api/customer-portal?customer_id=${billingData.subscription.dodo_customer_id}`
      window.location.href = portalUrl
    } catch (error) {
      console.error('Portal error:', error)
      toast.error('Failed to open billing portal')
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return
    }

    try {
      const response = await fetch('/api/v1/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          organizationId,
        }),
      })

      if (response.ok) {
        toast.success('Subscription will be cancelled at the end of your billing period')
        fetchBillingData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancel error:', error)
      toast.error('Failed to cancel subscription')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const currentPlan = PLANS.find(p => p.name === currentPlanName) || PLANS[0]
  const usagePercent = billingData?.usage 
    ? Math.min((billingData.usage.emails_sent / (currentPlan.limits.emails || 5000)) * 100, 100)
    : 0
  const contactsPercent = billingData?.usage?.contacts_count && currentPlan.limits.contacts > 0
    ? Math.min((billingData.usage.contacts_count / currentPlan.limits.contacts) * 100, 100)
    : 0

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Regional Pricing Banner */}
      {isIndia && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-lg">
          <MapPin className="h-4 w-4 text-orange-600" />
          <span className="text-[13px] text-orange-800">
            🇮🇳 You&apos;re viewing India pricing — <span className="font-medium">50% off</span> all paid plans!
          </span>
        </div>
      )}

      {/* Current Plan Banner */}
      <div className="border border-stone-200/60 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-[14px]">Current Plan</h3>
              <p className="text-[12px] text-muted-foreground">
                You&apos;re on the {currentPlanName} plan
                {billingData?.subscription?.cancel_at_period_end && (
                  <span className="text-orange-600 ml-2">(Cancels at period end)</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {billingData?.subscription?.status === 'past_due' ? (
              <Badge className="text-[11px] bg-red-50 text-red-700 border-red-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Past Due
              </Badge>
            ) : (
              <Badge className="text-[11px] bg-green-50 text-green-700 border-green-200">Active</Badge>
            )}
          </div>
        </div>

        {/* Usage Bars */}
        <div className="mt-4 pt-4 border-t border-stone-100 space-y-4">
          {/* Email Usage */}
          {currentPlan.limits.emails > 0 && (
            <div>
              <div className="flex items-center justify-between text-[12px] mb-2">
                <span className="text-muted-foreground">Monthly email usage</span>
                <span className="font-medium">
                  {billingData?.usage?.emails_sent?.toLocaleString() || 0} / {currentPlan.limits.emails.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Contacts Usage */}
          {currentPlan.limits.contacts > 0 && (
            <div>
              <div className="flex items-center justify-between text-[12px] mb-2">
                <span className="text-muted-foreground">Contacts</span>
                <span className="font-medium">
                  {billingData?.usage?.contacts_count?.toLocaleString() || 0} / {currentPlan.limits.contacts.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    contactsPercent > 90 ? 'bg-red-500' : contactsPercent > 70 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${contactsPercent}%` }}
                />
              </div>
            </div>
          )}

          {billingData?.subscription?.current_period_end && (
            <p className="text-[11px] text-muted-foreground">
              Resets on {formatDate(billingData.subscription.current_period_end)}
            </p>
          )}
        </div>
      </div>

      {/* Plans Grid - Free, Pro, Scale */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.filter(plan => plan.id !== 'enterprise').map((plan) => {
          const isCurrent = plan.name === currentPlanName
          const isDowngrade = PLANS.findIndex(p => p.name === currentPlanName) > PLANS.findIndex(p => p.name === plan.name)
          
          return (
            <div 
              key={plan.name}
              className={`relative border rounded-xl p-5 bg-white flex flex-col ${
                isCurrent ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200'
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

              <div className="mb-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-[13px] text-muted-foreground">{plan.period}</span>
              </div>
              
              <p className="text-[11px] text-muted-foreground mb-4 h-4">
                {'overage' in plan && plan.overage ? plan.overage : '\u00A0'}
              </p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[13px]">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={isCurrent ? "outline" : "default"}
                className={`w-full mt-auto ${!isCurrent ? 'bg-stone-900 hover:bg-stone-800' : ''}`}
                disabled={isCurrent || isDowngrade || upgrading !== null}
                onClick={() => handleUpgrade(plan.id)}
              >
                {upgrading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isCurrent ? (
                  'Current Plan'
                ) : isDowngrade ? (
                  'Downgrade via Portal'
                ) : (
                  'Upgrade'
                )}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Enterprise Plan - Full Width */}
      {(() => {
        const enterprisePlan = PLANS.find(p => p.id === 'enterprise')
        if (!enterprisePlan) return null
        const isCurrent = enterprisePlan.name === currentPlanName
        
        return (
          <div 
            className={`relative border rounded-xl p-6 bg-gradient-to-r from-stone-50 to-stone-100/50 ${
              isCurrent ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="font-semibold text-[18px]">{enterprisePlan.name}</h3>
                <p className="text-[13px] text-muted-foreground mt-1">{enterprisePlan.description}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                  {enterprisePlan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-[13px]">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <div>
                  <span className="text-3xl font-bold">{enterprisePlan.price}</span>
                </div>
                <Button 
                  variant={isCurrent ? "outline" : "default"}
                  className={`${!isCurrent ? 'bg-stone-900 hover:bg-stone-800' : ''}`}
                  disabled={isCurrent}
                  onClick={() => handleUpgrade(enterprisePlan.id)}
                >
                  {isCurrent ? 'Current Plan' : 'Contact Sales'}
                </Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Plan Features Comparison */}
      <div className="border border-stone-200/60 rounded-xl overflow-hidden bg-white">
        <div className="p-5 border-b border-stone-100">
          <h3 className="font-semibold text-[15px]">Plan Features</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Compare what&apos;s included in your current plan</p>
        </div>
        <div className="divide-y divide-stone-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px]">Monthly email limit</span>
            </div>
            <span className="text-[13px] font-medium">
              {currentPlan.limits.emails === -1 ? 'Unlimited' : currentPlan.limits.emails.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px]">Contacts</span>
            </div>
            <span className="text-[13px] font-medium">
              {currentPlan.limits.contacts === -1 ? 'Unlimited' : currentPlan.limits.contacts.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px]">Custom domains</span>
            </div>
            <span className="text-[13px] font-medium">
              {currentPlan.limits.domains === -1 ? 'Unlimited' : currentPlan.limits.domains}
            </span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px]">API keys</span>
            </div>
            <span className="text-[13px] font-medium">Unlimited</span>
          </div>
        </div>
      </div>

      {/* Payment Method / Billing Portal */}
      <div className="border border-stone-200/60 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h3 className="font-medium text-[14px]">Payment Method</h3>
              <p className="text-[12px] text-muted-foreground">
                {billingData?.subscription?.dodo_customer_id 
                  ? 'Manage your payment methods and billing details'
                  : 'No payment method on file'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {billingData?.subscription?.dodo_customer_id && (
              <Button variant="outline" size="sm" onClick={handleManageBilling}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            )}
            {billingData?.subscription?.dodo_subscription_id && !billingData.subscription.cancel_at_period_end && (
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCancelSubscription}>
                Cancel Plan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="border border-stone-200/60 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-[14px]">Billing History</h3>
            <p className="text-[12px] text-muted-foreground">Download past invoices</p>
          </div>
          {billingData?.subscription?.dodo_customer_id && (
            <Button variant="ghost" size="sm" className="text-[13px]" onClick={handleManageBilling}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </Button>
          )}
        </div>
        
        {billingData?.invoices && billingData.invoices.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {billingData.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13px] font-medium">
                    {formatCurrency(invoice.amount_paid, invoice.currency)}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {formatDate(invoice.paid_at || invoice.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      invoice.status === 'paid' 
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : invoice.status === 'failed'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {invoice.status}
                  </Badge>
                  {invoice.invoice_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[13px] text-muted-foreground">
            No billing history yet
          </div>
        )}
      </div>
    </div>
  )
}
