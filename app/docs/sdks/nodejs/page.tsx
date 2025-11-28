import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function NodeJSSDKPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-green-50 text-green-700 border-0">
          SDK
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Node.js SDK</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          The official Node.js SDK for Unosend. Works with Node.js 18+ and supports 
          TypeScript out of the box.
        </p>
      </div>

      {/* Installation */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Installation</h2>
        <div className="space-y-3">
          <CodeBlock code="npm install @unosend/node" filename="npm" />
          <CodeBlock code="yarn add @unosend/node" filename="yarn" />
          <CodeBlock code="pnpm add @unosend/node" filename="pnpm" />
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Requirements</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[14px] text-muted-foreground">Node.js 18 or higher</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[14px] text-muted-foreground">TypeScript 4.7+ (optional)</span>
          </li>
        </ul>
      </section>

      {/* Basic Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Basic Usage</h2>
        <CodeBlock 
          filename="index.ts"
          showLineNumbers
          code={`import { Unosend } from '@unosend/node';

// Initialize with your API key
const unosend = new Unosend(process.env.UNOSEND_API_KEY);

// Send an email
async function sendWelcomeEmail(email: string, name: string) {
  const { data, error } = await unosend.emails.send({
    from: 'hello@yourdomain.com',
    to: [email],
    subject: \`Welcome, \${name}!\`,
    html: \`<h1>Hello \${name}</h1><p>Welcome to our platform!</p>\`
  });

  if (error) {
    console.error('Failed to send:', error.message);
    return null;
  }

  return data;
}`}
        />
      </section>

      {/* Configuration */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Configuration Options</h2>
        <CodeBlock 
          filename="config.ts"
          showLineNumbers
          code={`import { Unosend } from '@unosend/node';

const unosend = new Unosend('un_your_api_key', {
  // Custom base URL (for testing/proxying)
  baseUrl: 'https://api.unosend.com',
  
  // Request timeout in milliseconds
  timeout: 30000,
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000
  }
});`}
        />
      </section>

      {/* Framework Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Framework Examples</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Next.js App Router</h3>
        <CodeBlock 
          filename="app/api/send/route.ts"
          showLineNumbers
          code={`import { NextResponse } from 'next/server';
import { Unosend } from '@unosend/node';

const unosend = new Unosend(process.env.UNOSEND_API_KEY!);

export async function POST(request: Request) {
  const { to, subject, html } = await request.json();

  const { data, error } = await unosend.emails.send({
    from: 'hello@yourdomain.com',
    to: [to],
    subject,
    html
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Express.js</h3>
        <CodeBlock 
          filename="routes/email.ts"
          showLineNumbers
          code={`import express from 'express';
import { Unosend } from '@unosend/node';

const router = express.Router();
const unosend = new Unosend(process.env.UNOSEND_API_KEY!);

router.post('/send', async (req, res) => {
  const { to, subject, html } = req.body;

  const { data, error } = await unosend.emails.send({
    from: 'hello@yourdomain.com',
    to: [to],
    subject,
    html
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ id: data.id });
});

export default router;`}
        />
      </section>

      {/* Error Handling */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Handling</h2>
        <CodeBlock 
          filename="error-handling.ts"
          showLineNumbers
          code={`import { Unosend, UnosendError } from '@unosend/node';

const unosend = new Unosend(process.env.UNOSEND_API_KEY!);

async function sendEmail() {
  const { data, error } = await unosend.emails.send({
    from: 'hello@yourdomain.com',
    to: ['user@example.com'],
    subject: 'Hello',
    html: '<p>Hello World</p>'
  });

  if (error) {
    // Handle specific error codes
    switch (error.code) {
      case 'rate_limit_exceeded':
        console.log('Rate limited, retry after:', error.retryAfter);
        break;
      case 'invalid_api_key':
        console.log('Check your API key');
        break;
      case 'domain_not_verified':
        console.log('Verify your sending domain');
        break;
      default:
        console.log('Error:', error.message);
    }
    return;
  }

  console.log('Email sent:', data.id);
}`}
        />
      </section>

      {/* TypeScript Types */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">TypeScript Support</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          The SDK includes full TypeScript definitions:
        </p>
        <CodeBlock 
          filename="types.ts"
          showLineNumbers
          code={`import type { 
  SendEmailOptions, 
  Email, 
  Domain, 
  Audience,
  Contact,
  Webhook 
} from '@unosend/node';

// All methods are fully typed
const sendOptions: SendEmailOptions = {
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Hello',
  html: '<p>Hello World</p>'
};`}
        />
      </section>

      {/* API Reference */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Available Methods</h2>
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50/80 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Method</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>emails.send()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Send an email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>emails.get()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Get email details</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a domain</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.verify()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Verify domain DNS</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audiences.create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create an audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>contacts.create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a contact</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>webhooks.create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create a webhook</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>templates.create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create a template</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Link 
            href="/docs/api/emails"
            className="inline-flex items-center text-[14px] text-stone-700 hover:text-stone-900"
          >
            View full API reference <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  )
}
