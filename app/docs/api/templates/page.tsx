import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'

export default function TemplatesAPIPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-blue-50 text-blue-700 border-0">
          API Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Templates</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Create and manage reusable email templates with variables. Templates support 
          HTML with variable substitution for dynamic content.
        </p>
      </div>

      {/* Create Template */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/templates</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Create a Template</h2>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Request Body</h3>
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50/80 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Parameter</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>name</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Template name</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>subject</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Email subject (supports variables)</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>html</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">HTML content (supports variables)</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>text</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Plain text version (optional)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.templates.create({
  name: 'Welcome Email',
  subject: 'Welcome to {{company_name}}, {{first_name}}!',
  html: \`
    <h1>Welcome, {{first_name}}!</h1>
    <p>Thanks for joining {{company_name}}.</p>
    <p>Here are your next steps:</p>
    <ul>
      <li>Complete your profile</li>
      <li>Explore features</li>
    </ul>
    <a href="{{dashboard_url}}">Go to Dashboard</a>
  \`,
  text: 'Welcome, {{first_name}}! Thanks for joining {{company_name}}.'
});`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "id": "tpl_xxxxxxxxxxxxxxxx",
  "name": "Welcome Email",
  "subject": "Welcome to {{company_name}}, {{first_name}}!",
  "variables": ["company_name", "first_name", "dashboard_url"],
  "created_at": "2024-01-15T10:30:00.000Z"
}`}
        />
      </section>

      {/* Variable Syntax */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Variable Syntax</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Use double curly braces for variables in your templates:
        </p>

        <CodeBlock 
          filename="Template Variables"
          showLineNumbers
          code={`<!-- Basic variable -->
Hello, {{first_name}}!

<!-- With default value -->
Hello, {{first_name | default: "there"}}!

<!-- Conditional content -->
{{#if premium}}
  <p>Thanks for being a premium member!</p>
{{/if}}

<!-- Loop through items -->
{{#each items}}
  <li>{{name}} - {{price}}</li>
{{/each}}`}
        />
      </section>

      {/* Send with Template */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending Emails with Templates</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Use <InlineCode>template_id</InlineCode> and <InlineCode>variables</InlineCode> when sending:
        </p>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.emails.send({
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  template_id: 'tpl_xxxxxxxxxxxxxxxx',
  variables: {
    first_name: 'John',
    company_name: 'Acme Inc',
    dashboard_url: 'https://app.acme.com/dashboard'
  }
});`}
        />
      </section>

      {/* List Templates */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/templates</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">List Templates</h2>

        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.templates.list();`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "data": [
    {
      "id": "tpl_xxxxxxxxxxxxxxxx",
      "name": "Welcome Email",
      "subject": "Welcome to {{company_name}}, {{first_name}}!",
      "variables": ["company_name", "first_name", "dashboard_url"],
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}`}
        />
      </section>

      {/* Get Template */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/templates/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Get Template</h2>

        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.templates.get('tpl_xxxxxxxxxxxxxxxx');`}
        />
      </section>

      {/* Update Template */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-yellow-50 text-yellow-700">PATCH</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/templates/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Update Template</h2>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.templates.update('tpl_xxxxxxxxxxxxxxxx', {
  subject: 'Welcome aboard, {{first_name}}!',
  html: '<h1>Welcome!</h1><p>Updated content here.</p>'
});`}
        />
      </section>

      {/* Delete Template */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-50 text-red-700">DELETE</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/templates/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Delete Template</h2>

        <CodeBlock 
          filename="Node.js"
          code={`const { error } = await unosend.templates.delete('tpl_xxxxxxxxxxxxxxxx');`}
        />
      </section>
    </div>
  )
}
