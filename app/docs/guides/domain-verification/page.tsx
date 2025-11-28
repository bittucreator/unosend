import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle, Globe, Shield, Mail } from 'lucide-react'

export default function DomainVerificationPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-emerald-50 text-emerald-700 border-0">
          Guide
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Domain Verification</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Learn how to verify your sending domain for better email deliverability. 
          Domain verification enables DKIM signing and improves inbox placement.
        </p>
      </div>

      {/* Why Verify */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Why Verify Your Domain?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-[13px] font-semibold text-stone-900">Better Deliverability</span>
            </div>
            <p className="text-[12px] text-muted-foreground">DKIM signing proves email authenticity</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-[13px] font-semibold text-stone-900">Custom Sender</span>
            </div>
            <p className="text-[12px] text-muted-foreground">Send from your own domain address</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-[13px] font-semibold text-stone-900">Brand Trust</span>
            </div>
            <p className="text-[12px] text-muted-foreground">Recipients see your domain, not ours</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-[13px] font-semibold text-stone-900">No Spam Warnings</span>
            </div>
            <p className="text-[12px] text-muted-foreground">Avoid &quot;via unosend.com&quot; labels</p>
          </div>
        </div>
      </section>

      {/* Step 1 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">1</span>
          <h2 className="text-xl font-bold text-stone-900">Add Your Domain</h2>
        </div>
        <p className="text-[14px] text-muted-foreground mb-4">
          First, add your domain to Unosend through the dashboard or API:
        </p>
        
        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.domains.create({
  domain: 'yourdomain.com'
});

// You'll receive DNS records to configure
console.log('DNS Records:', data.dns_records);`}
        />
      </section>

      {/* Step 2 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">2</span>
          <h2 className="text-xl font-bold text-stone-900">Configure DNS Records</h2>
        </div>
        <p className="text-[14px] text-muted-foreground mb-4">
          Add the following DNS records to your domain. Go to your DNS provider 
          (Cloudflare, Route53, GoDaddy, etc.) and add these records:
        </p>

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Domain Verification (TXT Record)</h3>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-4">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Field</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3">Type</td>
                <td className="px-4 py-3"><InlineCode>TXT</InlineCode></td>
              </tr>
              <tr>
                <td className="px-4 py-3">Name/Host</td>
                <td className="px-4 py-3"><InlineCode>_unosend</InlineCode></td>
              </tr>
              <tr>
                <td className="px-4 py-3">Value</td>
                <td className="px-4 py-3"><InlineCode>unosend-verification=xxxxxx</InlineCode></td>
              </tr>
              <tr>
                <td className="px-4 py-3">TTL</td>
                <td className="px-4 py-3">3600 (or Auto)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">DKIM Record (TXT Record)</h3>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-4">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Field</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3">Type</td>
                <td className="px-4 py-3"><InlineCode>TXT</InlineCode></td>
              </tr>
              <tr>
                <td className="px-4 py-3">Name/Host</td>
                <td className="px-4 py-3"><InlineCode>mail._domainkey</InlineCode></td>
              </tr>
              <tr>
                <td className="px-4 py-3">Value</td>
                <td className="px-4 py-3 text-[11px] break-all"><InlineCode>v=DKIM1; k=rsa; p=MIGf...</InlineCode></td>
              </tr>
              <tr>
                <td className="px-4 py-3">TTL</td>
                <td className="px-4 py-3">3600 (or Auto)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">SPF Record (TXT Record)</h3>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-4">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Field</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3">Type</td>
                <td className="px-4 py-3"><InlineCode>TXT</InlineCode></td>
              </tr>
              <tr>
                <td className="px-4 py-3">Name/Host</td>
                <td className="px-4 py-3"><InlineCode>@</InlineCode> (or leave blank)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Value</td>
                <td className="px-4 py-3"><InlineCode>v=spf1 include:spf.unosend.com ~all</InlineCode></td>
              </tr>
              <tr>
                <td className="px-4 py-3">TTL</td>
                <td className="px-4 py-3">3600 (or Auto)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
          <p className="text-[13px] text-blue-800">
            <strong>Note:</strong> If you already have an SPF record, add <InlineCode>include:spf.unosend.com</InlineCode> to your existing record instead of creating a new one.
          </p>
        </div>
      </section>

      {/* Step 3 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">3</span>
          <h2 className="text-xl font-bold text-stone-900">Verify Your Domain</h2>
        </div>
        <p className="text-[14px] text-muted-foreground mb-4">
          After adding DNS records, trigger verification. DNS propagation can take up to 48 hours, 
          but usually completes within a few minutes.
        </p>
        
        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`// Trigger verification check
const { data, error } = await unosend.domains.verify('dom_xxxxxxxx');

if (data.status === 'verified') {
  console.log('Domain verified successfully!');
} else {
  console.log('Still pending. Records:', data.dns_records);
}`}
        />
      </section>

      {/* DNS Provider Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Provider-Specific Instructions</h2>
        
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-stone-900 mb-2">Cloudflare</h3>
            <ol className="space-y-1 text-[13px] text-muted-foreground list-decimal list-inside">
              <li>Go to your domain in Cloudflare dashboard</li>
              <li>Click DNS in the sidebar</li>
              <li>Click &quot;Add record&quot; for each record</li>
              <li>Set proxy status to &quot;DNS only&quot; (gray cloud)</li>
            </ol>
          </div>
          
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-stone-900 mb-2">AWS Route 53</h3>
            <ol className="space-y-1 text-[13px] text-muted-foreground list-decimal list-inside">
              <li>Open Route 53 console</li>
              <li>Select your hosted zone</li>
              <li>Click &quot;Create record&quot; for each entry</li>
              <li>Use Simple routing</li>
            </ol>
          </div>
          
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-stone-900 mb-2">GoDaddy</h3>
            <ol className="space-y-1 text-[13px] text-muted-foreground list-decimal list-inside">
              <li>Go to your domain&apos;s DNS Management</li>
              <li>Click &quot;Add&quot; in the Records section</li>
              <li>Select TXT as the record type</li>
              <li>Enter the host and value</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Troubleshooting</h2>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[13px] font-semibold text-amber-900 mb-1">Verification taking too long?</h3>
                <p className="text-[12px] text-amber-800">
                  DNS propagation can take up to 48 hours. You can check propagation status at{' '}
                  <a href="https://dnschecker.org" className="underline">dnschecker.org</a>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[13px] font-semibold text-amber-900 mb-1">SPF record conflicts?</h3>
                <p className="text-[12px] text-amber-800">
                  You can only have one SPF record. Merge multiple includes into one record:
                  <InlineCode>v=spf1 include:spf.unosend.com include:other.com ~all</InlineCode>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[13px] font-semibold text-amber-900 mb-1">DKIM value too long?</h3>
                <p className="text-[12px] text-amber-800">
                  Some DNS providers have character limits. Split the value into multiple 
                  quoted strings if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success */}
      <section>
        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[15px] font-semibold text-green-900 mb-1">Verification Complete!</h3>
              <p className="text-[13px] text-green-800">
                Once verified, you can start sending emails from your domain. Your emails 
                will be DKIM-signed and show your domain as the sender.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
