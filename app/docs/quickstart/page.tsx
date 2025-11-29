import Link from 'next/link'
import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function QuickstartPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-blue-50 text-blue-700 border-0">
          5 min read
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Quick Start</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Get up and running with Unosend in under 5 minutes. This guide will walk you through 
          creating an account, getting your API key, and sending your first email.
        </p>
      </div>

      {/* Prerequisites */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Prerequisites</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span className="text-[14px] text-muted-foreground">A Unosend account (free to create)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span className="text-[14px] text-muted-foreground">Node.js 18+ or Python 3.8+ (for SDK usage)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span className="text-[14px] text-muted-foreground">A verified domain (optional, but recommended)</span>
          </li>
        </ul>
      </section>

      {/* Step 1 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">1</span>
          <h2 className="text-xl font-bold text-stone-900">Create an Account</h2>
        </div>
        <p className="text-[14px] text-muted-foreground mb-4">
          Sign up for a free Unosend account at{' '}
          <Link href="/signup" className="text-stone-900 underline underline-offset-2">
            unosend.com/signup
          </Link>
          . No credit card required.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-[13px] text-blue-800">
            <strong>Tip:</strong> You can send up to 5,000 emails/month for free with the free tier.
          </p>
        </div>
      </section>

      {/* Step 2 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">2</span>
          <h2 className="text-xl font-bold text-stone-900">Get Your API Key</h2>
        </div>
        <p className="text-[14px] text-muted-foreground mb-4">
          Navigate to <strong>Settings → API Keys</strong> in your dashboard and create a new API key. 
          Your API key will start with <InlineCode>un_</InlineCode> prefix.
        </p>
        <CodeBlock 
          code="un_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
          filename="Your API Key"
        />
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
          <p className="text-[13px] text-amber-800">
            <strong>Important:</strong> Keep your API key secure and never expose it in client-side code.
          </p>
        </div>
      </section>

      {/* Step 3 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">3</span>
          <h2 className="text-xl font-bold text-stone-900">Install the SDK</h2>
        </div>
        <p className="text-[14px] text-muted-foreground mb-4">
          Install the Unosend SDK for your preferred programming language:
        </p>
        
        <div className="space-y-3">
          <CodeBlock 
            code="npm install @unosend/node" 
            filename="Node.js"
          />
          <CodeBlock 
            code="pip install unosend" 
            filename="Python"
          />
          <CodeBlock 
            code="go get github.com/unosend/unosend-go" 
            filename="Go"
          />
        </div>
      </section>

      {/* Step 4 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">4</span>
          <h2 className="text-xl font-bold text-stone-900">Send Your First Email</h2>
        </div>
        <p className="text-[14px] text-muted-foreground mb-4">
          Create a new file and add the following code to send your first email:
        </p>
        
        <CodeBlock 
          filename="send-email.ts"
          showLineNumbers
          code={`import { Unosend } from '@unosend/node';

// Initialize the client with your API key
const unosend = new Unosend('un_your_api_key');

async function sendEmail() {
  try {
    const { data, error } = await unosend.emails.send({
      from: 'hello@yourdomain.com',
      to: ['recipient@example.com'],
      subject: 'Hello from Unosend!',
      html: '<h1>Welcome!</h1><p>This is your first email sent with Unosend.</p>'
    });

    if (error) {
      console.error('Error:', error.message);
      return;
    }

    console.log('Email sent successfully!');
    console.log('Email ID:', data.id);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

sendEmail();`}
        />
      </section>

      {/* Step 5 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">5</span>
          <h2 className="text-xl font-bold text-stone-900">Run the Code</h2>
        </div>
        <p className="text-[14px] text-muted-foreground mb-4">
          Execute your script to send the email:
        </p>
        
        <CodeBlock 
          code="npx ts-node send-email.ts"
          filename="Terminal"
        />

        <p className="text-[14px] text-muted-foreground mt-4">
          You should see output similar to:
        </p>
        
        <CodeBlock 
          code={`Email sent successfully!
Email ID: em_xxxxxxxxxxxxxxxxxxxxxxxx`}
          filename="Output"
        />
      </section>

      {/* Using cURL */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Alternative: Using cURL</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          You can also send emails directly using the REST API with cURL:
        </p>
        
        <CodeBlock 
          filename="cURL"
          showLineNumbers
          code={`curl -X POST https://api.unosend.com/v1/emails \\
  -H "Authorization: Bearer un_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@yourdomain.com",
    "to": ["recipient@example.com"],
    "subject": "Hello from Unosend!",
    "html": "<h1>Welcome!</h1><p>Sent with cURL.</p>"
  }'`}
        />
      </section>

      {/* Success */}
      <section className="mb-10">
        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[15px] font-semibold text-green-900 mb-1">You&apos;re all set!</h3>
              <p className="text-[13px] text-green-800 mb-3">
                Congratulations! You&apos;ve successfully sent your first email with Unosend. 
                Check your inbox to see the email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link 
            href="/docs/guides/domain-verification"
            className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition group"
          >
            <div className="flex-1">
              <h3 className="text-[14px] font-semibold text-stone-900 mb-0.5">Verify Your Domain</h3>
              <p className="text-[13px] text-muted-foreground">Set up DNS for better deliverability</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition" />
          </Link>
          <Link 
            href="/docs/api/emails"
            className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition group"
          >
            <div className="flex-1">
              <h3 className="text-[14px] font-semibold text-stone-900 mb-0.5">Emails API Reference</h3>
              <p className="text-[13px] text-muted-foreground">Learn all email options</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition" />
          </Link>
          <Link 
            href="/docs/guides/templates"
            className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition group"
          >
            <div className="flex-1">
              <h3 className="text-[14px] font-semibold text-stone-900 mb-0.5">Email Templates</h3>
              <p className="text-[13px] text-muted-foreground">Create reusable templates</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition" />
          </Link>
          <Link 
            href="/docs/guides/webhooks"
            className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition group"
          >
            <div className="flex-1">
              <h3 className="text-[14px] font-semibold text-stone-900 mb-0.5">Set Up Webhooks</h3>
              <p className="text-[13px] text-muted-foreground">Get real-time event notifications</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition" />
          </Link>
        </div>
      </section>
    </div>
  )
}
