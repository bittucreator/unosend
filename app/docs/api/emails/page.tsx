import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'

export default function EmailsAPIPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-blue-50 text-blue-700 border-0">
          API Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Emails</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Send transactional and marketing emails through the Unosend API. This endpoint 
          supports HTML, plain text, attachments, and more.
        </p>
      </div>

      {/* Send Email */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/emails</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Send an Email</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Send an email to one or more recipients. Returns the email ID for tracking.
        </p>

        {/* Request Body */}
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Request Body</h3>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Parameter</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Required</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>from</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3"><Badge className="text-[10px] bg-red-50 text-red-700 border-0">Required</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Sender email address</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>to</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string[]</td>
                <td className="px-4 py-3"><Badge className="text-[10px] bg-red-50 text-red-700 border-0">Required</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient email address(es)</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>subject</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3"><Badge className="text-[10px] bg-red-50 text-red-700 border-0">Required</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Email subject line</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>html</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">HTML content of the email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>text</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">Plain text content</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>cc</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string[]</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">CC recipients</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>bcc</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string[]</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">BCC recipients</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>reply_to</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">Reply-to address</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>attachments</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">object[]</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">File attachments</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>headers</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">object</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">Custom email headers</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>tags</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">object</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">Custom tags for analytics</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Example Request */}
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Example Request</h3>
        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`import { Unosend } from '@unosend/node';

const unosend = new Unosend('un_your_api_key');

const { data, error } = await unosend.emails.send({
  from: 'John Doe <john@yourdomain.com>',
  to: ['user@example.com'],
  cc: ['manager@example.com'],
  bcc: ['archive@yourdomain.com'],
  reply_to: 'support@yourdomain.com',
  subject: 'Welcome to Our Platform',
  html: \`
    <h1>Welcome!</h1>
    <p>Thanks for signing up. Here's what you can do next:</p>
    <ul>
      <li>Complete your profile</li>
      <li>Explore our features</li>
      <li>Connect with others</li>
    </ul>
  \`,
  text: 'Welcome! Thanks for signing up.',
  tags: {
    campaign: 'welcome-series',
    user_id: '12345'
  }
});`}
        />

        <div className="mt-4">
          <CodeBlock 
            filename="cURL"
            showLineNumbers
            code={`curl -X POST https://api.unosend.com/v1/emails \\
  -H "Authorization: Bearer un_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "John Doe <john@yourdomain.com>",
    "to": ["user@example.com"],
    "subject": "Welcome to Our Platform",
    "html": "<h1>Welcome!</h1><p>Thanks for signing up.</p>"
  }'`}
          />
        </div>

        {/* Response */}
        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          code={`{
  "id": "em_xxxxxxxxxxxxxxxxxxxxxxxx",
  "from": "john@yourdomain.com",
  "to": ["user@example.com"],
  "subject": "Welcome to Our Platform",
  "created_at": "2024-01-15T10:30:00.000Z"
}`}
        />
      </section>

      {/* Get Email */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/emails/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Get Email Details</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Retrieve the details and status of a previously sent email.
        </p>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Path Parameters</h3>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Parameter</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3"><InlineCode>id</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">The email ID (starts with <InlineCode>em_</InlineCode>)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Example Request</h3>
        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.emails.get('em_xxxxxxxxxxxxxxxx');`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "id": "em_xxxxxxxxxxxxxxxxxxxxxxxx",
  "from": "john@yourdomain.com",
  "to": ["user@example.com"],
  "subject": "Welcome to Our Platform",
  "status": "delivered",
  "created_at": "2024-01-15T10:30:00.000Z",
  "delivered_at": "2024-01-15T10:30:02.000Z",
  "opened_at": "2024-01-15T11:45:00.000Z",
  "clicked_at": null,
  "events": [
    {
      "type": "sent",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "type": "delivered",
      "timestamp": "2024-01-15T10:30:02.000Z"
    },
    {
      "type": "opened",
      "timestamp": "2024-01-15T11:45:00.000Z"
    }
  ]
}`}
        />
      </section>

      {/* Attachments */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending Attachments</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Include file attachments with your emails. Attachments should be base64 encoded.
        </p>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Attachment Object</h3>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Field</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>filename</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Name of the file</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>content</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Base64 encoded file content</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>content_type</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">MIME type (e.g., application/pdf)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`import fs from 'fs';
import path from 'path';

const pdfContent = fs.readFileSync('invoice.pdf');
const base64Content = pdfContent.toString('base64');

const { data, error } = await unosend.emails.send({
  from: 'billing@yourdomain.com',
  to: ['customer@example.com'],
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: base64Content,
      content_type: 'application/pdf'
    }
  ]
});`}
        />
      </section>

      {/* Email Status */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Email Status Values</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Each email goes through various status changes during its lifecycle:
        </p>
        
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><Badge className="bg-slate-100 text-slate-700 border-0">queued</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Email is queued for sending</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Badge className="bg-blue-50 text-blue-700 border-0">sent</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Email was sent to the mail server</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Badge className="bg-green-50 text-green-700 border-0">delivered</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Email was delivered to recipient</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Badge className="bg-purple-50 text-purple-700 border-0">opened</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient opened the email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Badge className="bg-indigo-50 text-indigo-700 border-0">clicked</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient clicked a link</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Badge className="bg-amber-50 text-amber-700 border-0">bounced</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Email bounced (hard or soft)</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Badge className="bg-orange-50 text-orange-700 border-0">complained</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient marked as spam</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Badge className="bg-red-50 text-red-700 border-0">failed</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Failed to send</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate Limits */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Rate Limits</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          The emails endpoint has the following rate limits:
        </p>
        
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Rate Limit</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Daily Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3">Free</td>
                <td className="px-4 py-3 text-muted-foreground">10 requests/second</td>
                <td className="px-4 py-3 text-muted-foreground">100 emails/day</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Pro</td>
                <td className="px-4 py-3 text-muted-foreground">100 requests/second</td>
                <td className="px-4 py-3 text-muted-foreground">50,000 emails/day</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Enterprise</td>
                <td className="px-4 py-3 text-muted-foreground">1,000 requests/second</td>
                <td className="px-4 py-3 text-muted-foreground">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
