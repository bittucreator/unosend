import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export default function TemplatesGuidePage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-emerald-50 text-emerald-700 border-0">
          Guide
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Email Templates</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Learn how to create and use reusable email templates with dynamic variables 
          for personalized email content.
        </p>
      </div>

      {/* Why Templates */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Why Use Templates?</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Consistency</strong> - Maintain brand consistency across all emails
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Efficiency</strong> - Write once, use many times
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Personalization</strong> - Dynamic variables for each recipient
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Easy Updates</strong> - Change template once, affects all future emails
            </p>
          </div>
        </div>
      </section>

      {/* Creating a Template */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Creating a Template</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Create a template with dynamic variables using double curly braces:
        </p>
        
        <CodeBlock 
          filename="create-template.ts"
          showLineNumbers
          code={`const { data, error } = await unosend.templates.create({
  name: 'Welcome Email',
  subject: 'Welcome to {{company_name}}, {{first_name}}!',
  html: \`
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px;">
  <h1>Welcome, {{first_name}}!</h1>
  <p>Thanks for joining {{company_name}}. We're excited to have you!</p>
  
  <h2>Getting Started</h2>
  <p>Here's what you can do next:</p>
  <ul>
    <li>Complete your profile</li>
    <li>Explore our features</li>
    <li>Check out the documentation</li>
  </ul>
  
  <a href="{{dashboard_url}}" 
     style="display: inline-block; padding: 12px 24px; 
            background: #000; color: #fff; text-decoration: none; 
            border-radius: 6px;">
    Go to Dashboard
  </a>
  
  <p style="margin-top: 32px; color: #666; font-size: 12px;">
    Best regards,<br>
    The {{company_name}} Team
  </p>
</body>
</html>
  \`,
  text: \`
Welcome, {{first_name}}!

Thanks for joining {{company_name}}. We're excited to have you!

Getting Started:
- Complete your profile
- Explore our features
- Check out the documentation

Visit your dashboard: {{dashboard_url}}

Best regards,
The {{company_name}} Team
  \`
});

console.log('Template ID:', data.id);
console.log('Variables:', data.variables); // ['company_name', 'first_name', 'dashboard_url']`}
        />
      </section>

      {/* Using Variables */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Variable Syntax</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Templates support various variable features:
        </p>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Basic Variables</h3>
        <CodeBlock 
          filename="basic-variables.html"
          code={`Hello, {{first_name}}!
Your email is: {{email}}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Default Values</h3>
        <CodeBlock 
          filename="default-values.html"
          code={`Hello, {{first_name | default: "there"}}!
Your plan: {{plan | default: "Free"}}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Conditional Content</h3>
        <CodeBlock 
          filename="conditionals.html"
          showLineNumbers
          code={`{{#if is_premium}}
<div class="premium-badge">Premium Member</div>
{{/if}}

{{#if has_items}}
<h2>Your Items</h2>
{{else}}
<p>No items yet. Start shopping!</p>
{{/if}}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Loops</h3>
        <CodeBlock 
          filename="loops.html"
          showLineNumbers
          code={`<h2>Your Order</h2>
<table>
  {{#each items}}
  <tr>
    <td>{{name}}</td>
    <td>{{quantity}}</td>
    <td>{{price}}</td>
  </tr>
  {{/each}}
</table>
<p>Total: {{total}}</p>`}
        />
      </section>

      {/* Sending with Templates */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending Emails with Templates</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Use <InlineCode>template_id</InlineCode> instead of <InlineCode>html</InlineCode> when sending:
        </p>
        
        <CodeBlock 
          filename="send-with-template.ts"
          showLineNumbers
          code={`const { data, error } = await unosend.emails.send({
  from: 'hello@yourdomain.com',
  to: ['john@example.com'],
  template_id: 'tpl_xxxxxxxxxxxxxxxx',
  variables: {
    first_name: 'John',
    company_name: 'Acme Inc',
    dashboard_url: 'https://app.acme.com/dashboard',
    is_premium: true
  }
});`}
        />
      </section>

      {/* Batch Sending */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Batch Sending with Templates</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Send personalized emails to multiple recipients efficiently:
        </p>
        
        <CodeBlock 
          filename="batch-send.ts"
          showLineNumbers
          code={`const recipients = [
  { email: 'john@example.com', first_name: 'John', plan: 'Pro' },
  { email: 'jane@example.com', first_name: 'Jane', plan: 'Free' },
  { email: 'bob@example.com', first_name: 'Bob', plan: 'Enterprise' },
];

// Send individually for personalization
const results = await Promise.all(
  recipients.map(recipient => 
    unosend.emails.send({
      from: 'hello@yourdomain.com',
      to: [recipient.email],
      template_id: 'tpl_xxxxxxxxxxxxxxxx',
      variables: {
        first_name: recipient.first_name,
        plan: recipient.plan,
        company_name: 'Acme Inc',
        dashboard_url: 'https://app.acme.com'
      }
    })
  )
);

console.log(\`Sent \${results.filter(r => r.data).length} emails\`);`}
        />
      </section>

      {/* Template Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Common Template Examples</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Order Confirmation</h3>
        <CodeBlock 
          filename="order-confirmation.html"
          showLineNumbers
          code={`<h1>Order Confirmed!</h1>
<p>Hi {{customer_name}},</p>
<p>Thanks for your order #{{order_number}}.</p>

<h2>Order Details</h2>
<table>
  <tr>
    <th>Item</th>
    <th>Qty</th>
    <th>Price</th>
  </tr>
  {{#each items}}
  <tr>
    <td>{{name}}</td>
    <td>{{quantity}}</td>
    <td>{{price}}</td>
  </tr>
  {{/each}}
</table>

<p><strong>Total: {{total}}</strong></p>
<p>Shipping to: {{shipping_address}}</p>`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Password Reset</h3>
        <CodeBlock 
          filename="password-reset.html"
          showLineNumbers
          code={`<h1>Reset Your Password</h1>
<p>Hi {{first_name | default: "there"}},</p>
<p>We received a request to reset your password.</p>

<a href="{{reset_url}}" 
   style="display: inline-block; padding: 12px 24px; 
          background: #000; color: #fff; text-decoration: none; 
          border-radius: 6px;">
  Reset Password
</a>

<p style="margin-top: 20px; color: #666; font-size: 13px;">
  This link will expire in {{expiry_hours}} hours.
</p>

<p style="color: #666; font-size: 12px;">
  If you didn't request this, please ignore this email.
</p>`}
        />
      </section>

      {/* Managing Templates */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Managing Templates</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Update a Template</h3>
        <CodeBlock 
          filename="update-template.ts"
          showLineNumbers
          code={`const { data, error } = await unosend.templates.update('tpl_xxxxxxxx', {
  subject: 'Welcome aboard, {{first_name}}!',
  html: '<h1>Updated welcome content</h1>'
});`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">List Templates</h3>
        <CodeBlock 
          filename="list-templates.ts"
          code={`const { data, error } = await unosend.templates.list();
console.log('Templates:', data);`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Delete a Template</h3>
        <CodeBlock 
          filename="delete-template.ts"
          code={`const { error } = await unosend.templates.delete('tpl_xxxxxxxx');`}
        />
      </section>
    </div>
  )
}
