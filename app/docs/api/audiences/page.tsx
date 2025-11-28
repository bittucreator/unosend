import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'

export default function AudiencesAPIPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-blue-50 text-blue-700 border-0">
          API Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Audiences</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Manage your email audiences (mailing lists). Create audiences, add contacts, 
          and use them for targeted email campaigns.
        </p>
      </div>

      {/* Create Audience */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/audiences</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Create an Audience</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Create a new audience to organize your contacts.
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
                <td className="px-4 py-3"><InlineCode>name</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Name of the audience</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.audiences.create({
  name: 'Newsletter Subscribers'
});

console.log('Audience ID:', data.id);`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          code={`{
  "id": "aud_xxxxxxxxxxxxxxxx",
  "name": "Newsletter Subscribers",
  "contact_count": 0,
  "created_at": "2024-01-15T10:30:00.000Z"
}`}
        />
      </section>

      {/* List Audiences */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/audiences</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">List Audiences</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Get a list of all audiences in your account.
        </p>

        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.audiences.list();`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "data": [
    {
      "id": "aud_xxxxxxxxxxxxxxxx",
      "name": "Newsletter Subscribers",
      "contact_count": 1250,
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "aud_yyyyyyyyyyyyyyyy",
      "name": "Product Updates",
      "contact_count": 890,
      "created_at": "2024-01-16T14:20:00.000Z"
    }
  ]
}`}
        />
      </section>

      {/* Get Audience */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/audiences/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Get Audience Details</h2>

        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.audiences.get('aud_xxxxxxxxxxxxxxxx');`}
        />
      </section>

      {/* Delete Audience */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-50 text-red-700">DELETE</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/audiences/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Delete Audience</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Delete an audience and all its contacts. This cannot be undone.
        </p>

        <CodeBlock 
          filename="Node.js"
          code={`const { error } = await unosend.audiences.delete('aud_xxxxxxxxxxxxxxxx');`}
        />
      </section>
    </div>
  )
}
