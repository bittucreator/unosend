import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Shield, AlertTriangle, Mail, Globe, Target, Clock } from 'lucide-react'

export default function DeliverabilityGuidePage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-emerald-50 text-emerald-700 border-0">
          Guide
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Email Deliverability</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Best practices to ensure your emails reach the inbox and avoid spam folders. 
          Learn about authentication, content optimization, and sender reputation.
        </p>
      </div>

      {/* What is Deliverability */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">What is Email Deliverability?</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Email deliverability is the ability to deliver emails to recipients&apos; inboxes. 
          Poor deliverability means your emails end up in spam folders or get rejected entirely.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <div className="text-3xl font-bold text-green-600 mb-1">95%+</div>
            <div className="text-[13px] text-muted-foreground">Target inbox rate</div>
          </div>
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <div className="text-3xl font-bold text-amber-600 mb-1">&lt;0.1%</div>
            <div className="text-[13px] text-muted-foreground">Target spam complaint rate</div>
          </div>
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <div className="text-3xl font-bold text-red-600 mb-1">&lt;2%</div>
            <div className="text-[13px] text-muted-foreground">Target bounce rate</div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          <Shield className="w-5 h-5 inline mr-2 text-blue-600" />
          Email Authentication
        </h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Authentication proves you&apos;re authorized to send from your domain. Set up these DNS records:
        </p>
        
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-stone-900 mb-2">SPF (Sender Policy Framework)</h3>
            <p className="text-[13px] text-muted-foreground mb-2">
              Specifies which mail servers can send email on behalf of your domain.
            </p>
            <div className="bg-stone-50 rounded-lg px-3 py-2">
              <code className="text-[12px] text-stone-700">v=spf1 include:spf.unosend.com ~all</code>
            </div>
          </div>
          
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-stone-900 mb-2">DKIM (DomainKeys Identified Mail)</h3>
            <p className="text-[13px] text-muted-foreground mb-2">
              Adds a digital signature to verify email hasn&apos;t been altered.
            </p>
            <div className="flex items-center gap-2 text-[13px] text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              Automatically configured when you verify your domain
            </div>
          </div>
          
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-stone-900 mb-2">DMARC (Domain-based Message Authentication)</h3>
            <p className="text-[13px] text-muted-foreground mb-2">
              Tells receiving servers what to do with unauthenticated emails.
            </p>
            <div className="bg-stone-50 rounded-lg px-3 py-2">
              <code className="text-[12px] text-stone-700">v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com</code>
            </div>
          </div>
        </div>
      </section>

      {/* Sender Reputation */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          <Target className="w-5 h-5 inline mr-2 text-purple-600" />
          Sender Reputation
        </h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Your sender reputation is a score that email providers use to decide if your 
          emails should be delivered. Here&apos;s how to build and maintain a good reputation:
        </p>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 text-[14px]">Start slow</strong>
              <p className="text-[13px] text-muted-foreground">
                Warm up new domains by gradually increasing send volume
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 text-[14px]">Send to engaged users first</strong>
              <p className="text-[13px] text-muted-foreground">
                High open rates early on boost your reputation
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 text-[14px]">Keep lists clean</strong>
              <p className="text-[13px] text-muted-foreground">
                Remove bounced emails and inactive subscribers
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 text-[14px]">Monitor complaints</strong>
              <p className="text-[13px] text-muted-foreground">
                Keep spam complaint rate below 0.1%
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 text-[14px]">Be consistent</strong>
              <p className="text-[13px] text-muted-foreground">
                Send regularly from the same domain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Best Practices */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          <Mail className="w-5 h-5 inline mr-2 text-green-600" />
          Content Best Practices
        </h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3 mt-6">Subject Lines</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-[12px] font-semibold text-green-700 mb-2">DO ✓</div>
            <ul className="space-y-1 text-[13px] text-green-800">
              <li>• Be clear and specific</li>
              <li>• Keep it under 50 characters</li>
              <li>• Personalize when possible</li>
              <li>• Create urgency naturally</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="text-[12px] font-semibold text-red-700 mb-2">DON&apos;T ✗</div>
            <ul className="space-y-1 text-[13px] text-red-800">
              <li>• Use ALL CAPS</li>
              <li>• Add excessive punctuation!!!</li>
              <li>• Use spam trigger words (FREE!!!)</li>
              <li>• Mislead about content</li>
            </ul>
          </div>
        </div>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3 mt-6">Email Body</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-[12px] font-semibold text-green-700 mb-2">DO ✓</div>
            <ul className="space-y-1 text-[13px] text-green-800">
              <li>• Include plain text version</li>
              <li>• Use a good text-to-image ratio</li>
              <li>• Include unsubscribe link</li>
              <li>• Add your physical address</li>
              <li>• Make links clearly visible</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="text-[12px] font-semibold text-red-700 mb-2">DON&apos;T ✗</div>
            <ul className="space-y-1 text-[13px] text-red-800">
              <li>• Use link shorteners</li>
              <li>• Embed forms in emails</li>
              <li>• Use image-only emails</li>
              <li>• Hide unsubscribe links</li>
              <li>• Include attachments (use links)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* List Hygiene */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          <Globe className="w-5 h-5 inline mr-2 text-amber-600" />
          List Hygiene
        </h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Maintain a clean email list to protect your sender reputation:
        </p>
        
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-stone-900 mb-2">Remove Hard Bounces</h3>
            <p className="text-[13px] text-muted-foreground">
              Immediately remove emails that hard bounce. Continued sending damages reputation.
            </p>
          </div>
          
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-stone-900 mb-2">Re-engage or Remove Inactive</h3>
            <p className="text-[13px] text-muted-foreground">
              After 6 months of no opens, send a re-engagement campaign. Remove those who don&apos;t respond.
            </p>
          </div>
          
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-stone-900 mb-2">Use Double Opt-in</h3>
            <p className="text-[13px] text-muted-foreground">
              Require email confirmation to ensure valid addresses and genuine interest.
            </p>
          </div>
          
          <div className="bg-white border border-stone-200/60 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-stone-900 mb-2">Honor Unsubscribes</h3>
            <p className="text-[13px] text-muted-foreground">
              Process unsubscribe requests immediately. Never re-add without explicit consent.
            </p>
          </div>
        </div>
      </section>

      {/* Warming Up */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          <Clock className="w-5 h-5 inline mr-2 text-orange-600" />
          Domain Warm-up
        </h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          New domains need to build reputation gradually. Here&apos;s a recommended warm-up schedule:
        </p>
        
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50/80 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Week</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Daily Volume</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3">Week 1</td>
                <td className="px-4 py-3">50-100</td>
                <td className="px-4 py-3 text-muted-foreground">Most engaged subscribers only</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Week 2</td>
                <td className="px-4 py-3">200-500</td>
                <td className="px-4 py-3 text-muted-foreground">Expand to recent subscribers</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Week 3</td>
                <td className="px-4 py-3">1,000-2,000</td>
                <td className="px-4 py-3 text-muted-foreground">Include more of your list</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Week 4</td>
                <td className="px-4 py-3">5,000-10,000</td>
                <td className="px-4 py-3 text-muted-foreground">Nearly full list</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Week 5+</td>
                <td className="px-4 py-3">Full volume</td>
                <td className="px-4 py-3 text-muted-foreground">Monitor metrics closely</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          <AlertTriangle className="w-5 h-5 inline mr-2 text-red-600" />
          Troubleshooting
        </h2>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-amber-900 mb-2">Emails going to spam?</h3>
            <ul className="space-y-1 text-[13px] text-amber-800">
              <li>• Check that SPF, DKIM, and DMARC are properly configured</li>
              <li>• Review your subject lines for spam triggers</li>
              <li>• Ensure you have a plain text version</li>
              <li>• Add unsubscribe link and physical address</li>
              <li>• Check your sender reputation at Google Postmaster Tools</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-amber-900 mb-2">High bounce rate?</h3>
            <ul className="space-y-1 text-[13px] text-amber-800">
              <li>• Clean your list - remove invalid addresses</li>
              <li>• Use double opt-in for new subscribers</li>
              <li>• Verify email addresses at sign-up</li>
              <li>• Don&apos;t buy email lists</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-amber-900 mb-2">Low open rates?</h3>
            <ul className="space-y-1 text-[13px] text-amber-800">
              <li>• Improve subject lines - A/B test different approaches</li>
              <li>• Send at optimal times for your audience</li>
              <li>• Segment and personalize content</li>
              <li>• Re-engage or remove inactive subscribers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Deliverability Checklist</h2>
        <div className="bg-white border border-stone-200/60 rounded-xl p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-stone-300" />
              <span className="text-[14px] text-stone-700">Domain verified with SPF, DKIM, and DMARC</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-stone-300" />
              <span className="text-[14px] text-stone-700">Unsubscribe link included in all emails</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-stone-300" />
              <span className="text-[14px] text-stone-700">Physical address included in emails</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-stone-300" />
              <span className="text-[14px] text-stone-700">Plain text version of all emails</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-stone-300" />
              <span className="text-[14px] text-stone-700">Bounce rate below 2%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-stone-300" />
              <span className="text-[14px] text-stone-700">Spam complaint rate below 0.1%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-stone-300" />
              <span className="text-[14px] text-stone-700">Regular list cleaning schedule</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-stone-300" />
              <span className="text-[14px] text-stone-700">Monitoring Google Postmaster Tools</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
