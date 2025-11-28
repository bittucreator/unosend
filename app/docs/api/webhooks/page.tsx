import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export default function WebhooksAPIPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-blue-50 text-blue-700 border-0">
          API Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Webhooks</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Receive real-time notifications about email events. Configure endpoints 
          to receive webhooks for delivery, opens, clicks, bounces, and more.
        </p>
      </div>

      {/* Webhook Events */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Available Events</h2>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Event</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>email.sent</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Email was sent to the recipient</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email.delivered</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Email was delivered to inbox</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email.opened</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient opened the email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email.clicked</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient clicked a link</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email.bounced</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Email bounced (hard or soft)</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email.complained</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient marked as spam</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>contact.created</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">New contact added to audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>contact.unsubscribed</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Contact unsubscribed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Webhook */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/webhooks</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Create a Webhook</h2>

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
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>url</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">HTTPS endpoint URL</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>events</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string[]</td>
                <td className="px-4 py-3 text-muted-foreground">Events to subscribe to</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.webhooks.create({
  url: 'https://yourdomain.com/webhooks/unosend',
  events: ['email.delivered', 'email.opened', 'email.clicked', 'email.bounced']
});

// Store the signing secret securely
console.log('Signing Secret:', data.signing_secret);`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "id": "wh_xxxxxxxxxxxxxxxx",
  "url": "https://yourdomain.com/webhooks/unosend",
  "events": ["email.delivered", "email.opened", "email.clicked", "email.bounced"],
  "signing_secret": "whsec_xxxxxxxxxxxxxxxxxxxx",
  "active": true,
  "created_at": "2024-01-15T10:30:00.000Z"
}`}
        />
      </section>

      {/* Webhook Payload */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Webhook Payload</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Webhooks are sent as HTTP POST requests with a JSON payload:
        </p>

        <CodeBlock 
          filename="Webhook Payload"
          showLineNumbers
          code={`{
  "id": "evt_xxxxxxxxxxxxxxxx",
  "type": "email.delivered",
  "created_at": "2024-01-15T10:30:00.000Z",
  "data": {
    "email_id": "em_xxxxxxxxxxxxxxxx",
    "from": "hello@yourdomain.com",
    "to": "user@example.com",
    "subject": "Welcome to Unosend",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}`}
        />
      </section>

      {/* Verify Signature */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Verifying Webhook Signatures</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Always verify webhook signatures to ensure requests are from Unosend:
        </p>

        <CodeBlock 
          filename="Node.js (Express)"
          showLineNumbers
          code={`import express from 'express';
import crypto from 'crypto';

const app = express();

// Use raw body for signature verification
app.post('/webhooks/unosend', 
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-unosend-signature'];
    const timestamp = req.headers['x-unosend-timestamp'];
    const body = req.body.toString();
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(\`\${timestamp}.\${body}\`)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Check timestamp to prevent replay attacks
    const eventTime = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - eventTime > 300) { // 5 minute tolerance
      return res.status(401).json({ error: 'Timestamp too old' });
    }
    
    // Process the webhook
    const event = JSON.parse(body);
    console.log('Received event:', event.type);
    
    // Handle different event types
    switch (event.type) {
      case 'email.delivered':
        // Handle delivery
        break;
      case 'email.bounced':
        // Handle bounce
        break;
    }
    
    res.json({ received: true });
  }
);`}
        />
      </section>

      {/* List Webhooks */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/webhooks</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">List Webhooks</h2>

        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.webhooks.list();`}
        />
      </section>

      {/* Delete Webhook */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-50 text-red-700">DELETE</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/webhooks/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Delete Webhook</h2>

        <CodeBlock 
          filename="Node.js"
          code={`const { error } = await unosend.webhooks.delete('wh_xxxxxxxxxxxxxxxx');`}
        />
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">Always verify webhook signatures before processing</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">Return a 200 response quickly to avoid timeouts</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">Process webhooks asynchronously using a queue</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">Handle duplicate events (use event ID for idempotency)</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">Use HTTPS endpoints only (HTTP is rejected)</p>
          </div>
        </div>
      </section>
    </div>
  )
}
