import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'

export default function ContactsAPIPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-blue-50 text-blue-700 border-0">
          API Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Contacts</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Manage contacts within your audiences. Add, update, and remove contacts 
          from your mailing lists.
        </p>
      </div>

      {/* Create Contact */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/audiences/:audienceId/contacts</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Create a Contact</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Add a new contact to an audience.
        </p>

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
                <td className="px-4 py-3"><InlineCode>email</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3"><Badge className="text-[10px] bg-red-50 text-red-700 border-0">Required</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">Email address</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>first_name</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">First name</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>last_name</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">Last name</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>unsubscribed</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">boolean</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">Subscription status</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>metadata</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">object</td>
                <td className="px-4 py-3 text-muted-foreground">Optional</td>
                <td className="px-4 py-3 text-muted-foreground">Custom data</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.contacts.create({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  metadata: {
    plan: 'pro',
    signup_source: 'website'
  }
});`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "id": "con_xxxxxxxxxxxxxxxx",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "unsubscribed": false,
  "metadata": {
    "plan": "pro",
    "signup_source": "website"
  },
  "created_at": "2024-01-15T10:30:00.000Z"
}`}
        />
      </section>

      {/* List Contacts */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/audiences/:audienceId/contacts</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">List Contacts</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Get a paginated list of contacts in an audience.
        </p>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Query Parameters</h3>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Parameter</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Default</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>limit</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">50</td>
                <td className="px-4 py-3 text-muted-foreground">Number of results (max 100)</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>offset</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">0</td>
                <td className="px-4 py-3 text-muted-foreground">Offset for pagination</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.contacts.list({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  limit: 50,
  offset: 0
});

console.log('Total contacts:', data.total);
console.log('Contacts:', data.data);`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "data": [
    {
      "id": "con_xxxxxxxxxxxxxxxx",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "unsubscribed": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1250,
  "limit": 50,
  "offset": 0
}`}
        />
      </section>

      {/* Update Contact */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-yellow-50 text-yellow-700">PATCH</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/contacts/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Update a Contact</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Update contact information or subscription status.
        </p>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.contacts.update('con_xxxxxxxxxxxxxxxx', {
  first_name: 'Jane',
  unsubscribed: true
});`}
        />
      </section>

      {/* Delete Contact */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-50 text-red-700">DELETE</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/contacts/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Delete a Contact</h2>

        <CodeBlock 
          filename="Node.js"
          code={`const { error } = await unosend.contacts.delete('con_xxxxxxxxxxxxxxxx');`}
        />
      </section>

      {/* Bulk Import */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/audiences/:audienceId/contacts/bulk</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Bulk Import Contacts</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Import multiple contacts at once (up to 1000 per request).
        </p>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.contacts.bulk({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  contacts: [
    { email: 'user1@example.com', first_name: 'John' },
    { email: 'user2@example.com', first_name: 'Jane' },
    { email: 'user3@example.com', first_name: 'Bob' }
  ],
  skip_duplicates: true
});

console.log('Imported:', data.imported);
console.log('Skipped:', data.skipped);`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          code={`{
  "imported": 2,
  "skipped": 1,
  "errors": []
}`}
        />
      </section>
    </div>
  )
}
