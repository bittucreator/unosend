import { CodeBlock } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Mail, Paperclip, Users } from 'lucide-react'

export default function SendingEmailsPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-emerald-50 text-emerald-700 border-0">
          Guide
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Sending Emails</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Learn how to send different types of emails with Unosend, from simple 
          messages to complex HTML emails with attachments.
        </p>
      </div>

      {/* Basic Email */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending a Basic Email</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          The simplest way to send an email with Unosend:
        </p>
        
        <CodeBlock 
          filename="basic-email.ts"
          showLineNumbers
          code={`import { Unosend } from '@unosend/node';

const unosend = new Unosend(process.env.UNOSEND_API_KEY);

const { data, error } = await unosend.emails.send({
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Hello from Unosend!',
  html: '<h1>Hello World</h1><p>This is a test email.</p>'
});

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Email sent! ID:', data.id);
}`}
        />
      </section>

      {/* Email Options */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Email Options</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <Mail className="w-5 h-5 text-stone-600 mb-2" />
            <h3 className="text-[13px] font-semibold text-stone-900 mb-1">CC & BCC</h3>
            <p className="text-[12px] text-muted-foreground">Send copies to additional recipients</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <Paperclip className="w-5 h-5 text-stone-600 mb-2" />
            <h3 className="text-[13px] font-semibold text-stone-900 mb-1">Attachments</h3>
            <p className="text-[12px] text-muted-foreground">Include files with your emails</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <Users className="w-5 h-5 text-stone-600 mb-2" />
            <h3 className="text-[13px] font-semibold text-stone-900 mb-1">Reply-To</h3>
            <p className="text-[12px] text-muted-foreground">Set a different reply address</p>
          </div>
        </div>

        <CodeBlock 
          filename="full-options.ts"
          showLineNumbers
          code={`const { data, error } = await unosend.emails.send({
  // Required fields
  from: 'John Doe <john@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Welcome to Our Platform',
  
  // Content (at least one required)
  html: '<h1>Welcome!</h1><p>Thanks for joining us.</p>',
  text: 'Welcome! Thanks for joining us.',
  
  // Optional recipients
  cc: ['manager@yourdomain.com'],
  bcc: ['archive@yourdomain.com'],
  
  // Reply configuration
  replyTo: 'support@yourdomain.com',
  
  // Custom headers
  headers: {
    'X-Custom-Header': 'custom-value'
  },
  
  // Tags for analytics
  tags: {
    campaign: 'onboarding',
    user_type: 'new'
  }
});`}
        />
      </section>

      {/* Sender Name */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sender Name Formats</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          You can specify the sender name in different ways:
        </p>
        
        <CodeBlock 
          filename="sender-formats.ts"
          showLineNumbers
          code={`// Email only
from: 'hello@yourdomain.com'

// Name and email
from: 'John Doe <john@yourdomain.com>'

// Company name
from: 'Acme Inc <hello@acme.com>'

// No-reply address
from: 'Acme Inc <no-reply@acme.com>'`}
        />
      </section>

      {/* Multiple Recipients */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending to Multiple Recipients</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Send the same email to multiple recipients:
        </p>
        
        <CodeBlock 
          filename="multiple-recipients.ts"
          showLineNumbers
          code={`// Multiple TO recipients
const { data, error } = await unosend.emails.send({
  from: 'hello@yourdomain.com',
  to: [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  ],
  subject: 'Team Update',
  html: '<p>Hi team, here is an update...</p>'
});

// Note: All recipients will see each other's addresses
// For private sends, use BCC or send individual emails`}
        />

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
          <p className="text-[13px] text-blue-800">
            <strong>Tip:</strong> For personalized bulk emails, send individual requests 
            or use our batch endpoint with templates.
          </p>
        </div>
      </section>

      {/* Attachments */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending Attachments</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Attach files to your emails using base64 encoding:
        </p>
        
        <CodeBlock 
          filename="attachments.ts"
          showLineNumbers
          code={`import fs from 'fs';
import path from 'path';

// Read and encode file
const pdfBuffer = fs.readFileSync('report.pdf');
const base64Content = pdfBuffer.toString('base64');

const { data, error } = await unosend.emails.send({
  from: 'billing@yourdomain.com',
  to: ['customer@example.com'],
  subject: 'Your Monthly Report',
  html: '<p>Please find your monthly report attached.</p>',
  attachments: [
    {
      filename: 'report.pdf',
      content: base64Content,
      contentType: 'application/pdf'
    },
    {
      filename: 'data.csv',
      content: Buffer.from('Name,Email\\nJohn,john@test.com').toString('base64'),
      contentType: 'text/csv'
    }
  ]
});`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Supported Content Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'application/pdf',
            'image/png',
            'image/jpeg',
            'text/csv',
            'text/plain',
            'application/zip',
            'application/json',
            'text/html'
          ].map((type) => (
            <div key={type} className="bg-white border border-stone-200 rounded-lg px-3 py-2">
              <code className="text-[11px] text-stone-700">{type}</code>
            </div>
          ))}
        </div>
      </section>

      {/* HTML Email */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Rich HTML Emails</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Create beautiful HTML emails with styling:
        </p>
        
        <CodeBlock 
          filename="html-email.ts"
          showLineNumbers
          code={`const htmlContent = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1a1a1a;">Welcome to Unosend!</h1>
    <p>Hi {{name}},</p>
    <p>Thanks for signing up. Here's what you can do next:</p>
    <ul>
      <li>Complete your profile</li>
      <li>Explore our features</li>
      <li>Send your first email</li>
    </ul>
    <a href="https://dashboard.unosend.com" 
       style="display: inline-block; padding: 12px 24px; 
              background: #000; color: #fff; text-decoration: none; 
              border-radius: 6px; margin-top: 16px;">
      Go to Dashboard
    </a>
    <p style="margin-top: 32px; font-size: 12px; color: #666;">
      © 2024 Your Company. All rights reserved.
    </p>
  </div>
</body>
</html>
\`;

const { data, error } = await unosend.emails.send({
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Welcome to Unosend!',
  html: htmlContent,
  // Always include plain text fallback
  text: 'Welcome to Unosend! Visit dashboard.unosend.com to get started.'
});`}
        />

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
          <p className="text-[13px] text-blue-800">
            <strong>Best Practice:</strong> Always include a plain text version for 
            email clients that don&apos;t support HTML.
          </p>
        </div>
      </section>

      {/* Error Handling */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Handling</h2>
        <CodeBlock 
          filename="error-handling.ts"
          showLineNumbers
          code={`const { data, error } = await unosend.emails.send({
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Test Email',
  html: '<p>Hello</p>'
});

if (error) {
  switch (error.code) {
    case 'validation_error':
      console.log('Invalid request:', error.message);
      break;
    case 'domain_not_verified':
      console.log('Please verify your domain first');
      break;
    case 'rate_limit_exceeded':
      console.log('Rate limited, retry after:', error.retryAfter);
      break;
    case 'insufficient_quota':
      console.log('Upgrade your plan for more emails');
      break;
    default:
      console.log('Error:', error.message);
  }
  return;
}

console.log('Success! Email ID:', data.id);`}
        />
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              Always verify your sending domain for better deliverability
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              Include both HTML and plain text versions of your email
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              Use inline CSS for HTML emails (external stylesheets often don&apos;t work)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              Keep attachment sizes under 10MB for best delivery
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              Use tags to track email campaigns and analyze performance
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
