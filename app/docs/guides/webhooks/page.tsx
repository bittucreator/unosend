import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Shield, RefreshCw } from 'lucide-react'

export default function WebhooksGuidePage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-emerald-50 text-emerald-700 border-0">
          Guide
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Webhooks</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Receive real-time notifications about email events like deliveries, 
          opens, clicks, and bounces via HTTP webhooks.
        </p>
      </div>

      {/* How it Works */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">How Webhooks Work</h2>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <span className="text-2xl font-bold text-stone-200 block mb-2">1</span>
            <h3 className="text-[13px] font-semibold text-stone-900 mb-1">Event Occurs</h3>
            <p className="text-[12px] text-muted-foreground">Email is delivered, opened, clicked, etc.</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <span className="text-2xl font-bold text-stone-200 block mb-2">2</span>
            <h3 className="text-[13px] font-semibold text-stone-900 mb-1">We Send POST</h3>
            <p className="text-[12px] text-muted-foreground">HTTP POST to your endpoint</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <span className="text-2xl font-bold text-stone-200 block mb-2">3</span>
            <h3 className="text-[13px] font-semibold text-stone-900 mb-1">You Verify</h3>
            <p className="text-[12px] text-muted-foreground">Validate signature for security</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <span className="text-2xl font-bold text-stone-200 block mb-2">4</span>
            <h3 className="text-[13px] font-semibold text-stone-900 mb-1">Process Event</h3>
            <p className="text-[12px] text-muted-foreground">Update your database, trigger actions</p>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Event Types</h2>
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
                <td className="px-4 py-3 text-muted-foreground">Email was sent to recipient</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email.delivered</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Email was delivered to recipient&apos;s inbox</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email.opened</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient opened the email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email.clicked</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Recipient clicked a link in the email</td>
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
                <td className="px-4 py-3"><InlineCode>contact.unsubscribed</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Contact unsubscribed from emails</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Creating a Webhook */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Creating a Webhook</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Create a webhook endpoint to receive events:
        </p>
        
        <CodeBlock 
          filename="create-webhook.ts"
          showLineNumbers
          code={`const { data, error } = await unosend.webhooks.create({
  url: 'https://yourapp.com/api/webhooks/unosend',
  events: [
    'email.delivered',
    'email.opened',
    'email.clicked',
    'email.bounced',
    'email.complained'
  ]
});

console.log('Webhook ID:', data.id);
console.log('Signing Secret:', data.signing_secret);
// Store this secret securely - you'll need it to verify webhooks`}
        />
      </section>

      {/* Webhook Payload */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Webhook Payload</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Each webhook request includes the following structure:
        </p>
        
        <CodeBlock 
          filename="webhook-payload.json"
          showLineNumbers
          code={`{
  "id": "evt_xxxxxxxxxxxxxxxx",
  "type": "email.delivered",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "email_id": "eml_xxxxxxxxxxxxxxxx",
    "from": "hello@yourdomain.com",
    "to": "user@example.com",
    "subject": "Welcome to Our Platform",
    "tags": {
      "campaign": "onboarding"
    }
  }
}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Click Event Example</h3>
        <CodeBlock 
          filename="click-event.json"
          showLineNumbers
          code={`{
  "id": "evt_xxxxxxxxxxxxxxxx",
  "type": "email.clicked",
  "created_at": "2024-01-15T11:45:00Z",
  "data": {
    "email_id": "eml_xxxxxxxxxxxxxxxx",
    "to": "user@example.com",
    "link": "https://yourdomain.com/pricing",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1"
  }
}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Bounce Event Example</h3>
        <CodeBlock 
          filename="bounce-event.json"
          showLineNumbers
          code={`{
  "id": "evt_xxxxxxxxxxxxxxxx",
  "type": "email.bounced",
  "created_at": "2024-01-15T10:32:00Z",
  "data": {
    "email_id": "eml_xxxxxxxxxxxxxxxx",
    "to": "invalid@example.com",
    "bounce_type": "hard",
    "bounce_reason": "User unknown"
  }
}`}
        />
      </section>

      {/* Verifying Webhooks */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Verifying Webhook Signatures</h2>
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-800">
            <strong>Important:</strong> Always verify webhook signatures to ensure requests are from Unosend.
          </p>
        </div>
        
        <p className="text-[14px] text-muted-foreground mb-4">
          Each webhook request includes a signature in the <InlineCode>X-Unosend-Signature</InlineCode> header:
        </p>
        
        <CodeBlock 
          filename="verify-webhook.ts"
          showLineNumbers
          code={`import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(\`sha256=\${expectedSignature}\`)
  );
}

// In your webhook handler
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('X-Unosend-Signature');
  const secret = process.env.UNOSEND_WEBHOOK_SECRET!;
  
  if (!verifyWebhookSignature(payload, signature!, secret)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const event = JSON.parse(payload);
  // Process the event...
  
  return new Response('OK', { status: 200 });
}`}
        />
      </section>

      {/* Example Handler */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Complete Webhook Handler</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Next.js App Router</h3>
        <CodeBlock 
          filename="app/api/webhooks/unosend/route.ts"
          showLineNumbers
          code={`import { NextResponse } from 'next/server';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.UNOSEND_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === \`sha256=\${expected}\`;
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('X-Unosend-Signature');
  
  if (!signature || !verifySignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(payload);
  
  switch (event.type) {
    case 'email.delivered':
      await handleDelivered(event.data);
      break;
    case 'email.opened':
      await handleOpened(event.data);
      break;
    case 'email.clicked':
      await handleClicked(event.data);
      break;
    case 'email.bounced':
      await handleBounced(event.data);
      break;
    case 'email.complained':
      await handleComplaint(event.data);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
  
  return NextResponse.json({ received: true });
}

async function handleDelivered(data: any) {
  // Update email status in database
  await db.emails.update({
    where: { id: data.email_id },
    data: { status: 'delivered', delivered_at: new Date() }
  });
}

async function handleOpened(data: any) {
  // Track email open
  await db.emailEvents.create({
    data: { email_id: data.email_id, type: 'open', timestamp: new Date() }
  });
}

async function handleClicked(data: any) {
  // Track link click
  await db.emailEvents.create({
    data: {
      email_id: data.email_id,
      type: 'click',
      link: data.link,
      timestamp: new Date()
    }
  });
}

async function handleBounced(data: any) {
  // Mark email as bounced, maybe suppress future sends
  await db.contacts.update({
    where: { email: data.to },
    data: { 
      bounced: true, 
      bounce_type: data.bounce_type,
      bounce_reason: data.bounce_reason
    }
  });
}

async function handleComplaint(data: any) {
  // Unsubscribe user immediately
  await db.contacts.update({
    where: { email: data.to },
    data: { unsubscribed: true, complaint: true }
  });
}`}
        />
      </section>

      {/* Retry Logic */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Retry Logic</h2>
        <div className="flex items-start gap-2 mb-4">
          <RefreshCw className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
          <p className="text-[14px] text-muted-foreground">
            If your endpoint returns a non-2xx status code, we&apos;ll retry the webhook:
          </p>
        </div>
        <ul className="space-y-2 text-[14px] text-muted-foreground ml-6">
          <li>• 1st retry: 1 minute after failure</li>
          <li>• 2nd retry: 5 minutes after failure</li>
          <li>• 3rd retry: 30 minutes after failure</li>
          <li>• 4th retry: 2 hours after failure</li>
          <li>• 5th retry: 8 hours after failure</li>
        </ul>
        <p className="text-[14px] text-muted-foreground mt-4">
          After 5 failed attempts, the webhook is marked as failed and won&apos;t be retried.
        </p>
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Always verify signatures</strong> to ensure webhooks are from Unosend
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Return 200 quickly</strong> and process events asynchronously
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Handle duplicates</strong> - use event ID for idempotency
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Log all events</strong> for debugging and auditing
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Use HTTPS</strong> for your webhook endpoint
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
