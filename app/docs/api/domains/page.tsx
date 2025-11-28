import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function DomainsAPIPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-blue-50 text-blue-700 border-0">
          API Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Domains</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Add and verify your sending domains. Domain verification improves deliverability 
          and allows you to send from your own domain.
        </p>
      </div>

      {/* Domain Status */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Domain Status</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-[13px] font-semibold text-stone-900">Pending</span>
            </div>
            <p className="text-[12px] text-muted-foreground">DNS records not yet configured</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-[13px] font-semibold text-stone-900">Verified</span>
            </div>
            <p className="text-[12px] text-muted-foreground">Domain is verified and ready</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-[13px] font-semibold text-stone-900">Failed</span>
            </div>
            <p className="text-[12px] text-muted-foreground">Verification failed</p>
          </div>
        </div>
      </section>

      {/* Add Domain */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/domains</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Add a Domain</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Add a new sending domain to your account. Returns DNS records to configure.
        </p>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Request Body</h3>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Parameter</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3"><InlineCode>domain</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Domain name to add (e.g., yourdomain.com)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.domains.create({
  domain: 'yourdomain.com'
});

console.log('DNS Records to configure:', data.dns_records);`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "id": "dom_xxxxxxxxxxxxxxxx",
  "domain": "yourdomain.com",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00.000Z",
  "dns_records": [
    {
      "type": "TXT",
      "name": "_unosend",
      "value": "unosend-verification=xxxxx",
      "ttl": 3600,
      "status": "pending",
      "purpose": "domain_verification"
    },
    {
      "type": "TXT",
      "name": "mail._domainkey",
      "value": "v=DKIM1; k=rsa; p=MIGfMA0...",
      "ttl": 3600,
      "status": "pending",
      "purpose": "dkim"
    },
    {
      "type": "TXT",
      "name": "@",
      "value": "v=spf1 include:spf.unosend.com ~all",
      "ttl": 3600,
      "status": "pending",
      "purpose": "spf"
    },
    {
      "type": "MX",
      "name": "bounce",
      "value": "feedback-smtp.unosend.com",
      "priority": 10,
      "ttl": 3600,
      "status": "pending",
      "purpose": "bounce_handling"
    }
  ]
}`}
        />
      </section>

      {/* List Domains */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/domains</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">List Domains</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Get a list of all domains in your account.
        </p>

        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.domains.list();`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "data": [
    {
      "id": "dom_xxxxxxxxxxxxxxxx",
      "domain": "yourdomain.com",
      "status": "verified",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "dom_yyyyyyyyyyyyyyyy",
      "domain": "anotherdomain.com",
      "status": "pending",
      "created_at": "2024-01-16T14:20:00.000Z"
    }
  ]
}`}
        />
      </section>

      {/* Get Domain */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/domains/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Get Domain Details</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Retrieve details for a specific domain including DNS records and status.
        </p>

        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.domains.get('dom_xxxxxxxxxxxxxxxx');`}
        />
      </section>

      {/* Verify Domain */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/domains/:id/verify</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Verify Domain</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Trigger a DNS verification check for a domain. Returns updated status.
        </p>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.domains.verify('dom_xxxxxxxxxxxxxxxx');

if (data.status === 'verified') {
  console.log('Domain is verified!');
} else {
  console.log('DNS records still pending:', data.dns_records);
}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "id": "dom_xxxxxxxxxxxxxxxx",
  "domain": "yourdomain.com",
  "status": "verified",
  "dns_records": [
    {
      "type": "TXT",
      "name": "_unosend",
      "status": "verified",
      "purpose": "domain_verification"
    },
    {
      "type": "TXT",
      "name": "mail._domainkey",
      "status": "verified",
      "purpose": "dkim"
    }
  ]
}`}
        />
      </section>

      {/* Delete Domain */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-50 text-red-700">DELETE</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/domains/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Delete Domain</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Remove a domain from your account. This cannot be undone.
        </p>

        <CodeBlock 
          filename="Node.js"
          code={`const { error } = await unosend.domains.delete('dom_xxxxxxxxxxxxxxxx');`}
        />

        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
          <p className="text-[13px] text-amber-800">
            <strong>Warning:</strong> Deleting a domain will prevent you from sending emails from that domain.
          </p>
        </div>
      </section>
    </div>
  )
}
