import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

export default function APIKeysPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-blue-50 text-blue-700 border-0">
          API Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">API Keys</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Create and manage API keys for authenticating requests. Each key can have 
          different permissions for security.
        </p>
      </div>

      {/* Create API Key */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700">POST</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/api-keys</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Create an API Key</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Create a new API key with specified permissions. The full key is only shown once.
        </p>

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
                <td className="px-4 py-3 text-muted-foreground">A descriptive name for the key</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>scopes</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string[]</td>
                <td className="px-4 py-3 text-muted-foreground">Permissions for the key</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>expires_at</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">string</td>
                <td className="px-4 py-3 text-muted-foreground">Optional expiration date (ISO 8601)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Available Scopes</h3>
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50/80 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Scope</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>emails:send</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Send emails</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>emails:read</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Read email status</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains:manage</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Manage domains</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audiences:manage</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Manage audiences</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>webhooks:manage</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Manage webhooks</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>full_access</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">All permissions</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock 
          filename="Node.js"
          showLineNumbers
          code={`const { data, error } = await unosend.apiKeys.create({
  name: 'Production Server',
  scopes: ['emails:send', 'emails:read'],
  expires_at: '2025-12-31T23:59:59Z'
});

// Store this key securely - it's only shown once!
console.log('API Key:', data.key);`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "id": "key_xxxxxxxxxxxxxxxx",
  "name": "Production Server",
  "key": "un_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "scopes": ["emails:send", "emails:read"],
  "created_at": "2024-01-15T10:30:00.000Z",
  "expires_at": "2025-12-31T23:59:59Z",
  "last_used_at": null
}`}
        />

        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-800">
              <strong>Important:</strong> The full API key is only returned once. Store it securely.
            </p>
          </div>
        </div>
      </section>

      {/* List API Keys */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-50 text-green-700">GET</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/api-keys</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">List API Keys</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Get a list of all API keys. Only shows partial keys for security.
        </p>

        <CodeBlock 
          filename="Node.js"
          code={`const { data, error } = await unosend.apiKeys.list();`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Response</h3>
        <CodeBlock 
          filename="200 OK"
          showLineNumbers
          code={`{
  "data": [
    {
      "id": "key_xxxxxxxxxxxxxxxx",
      "name": "Production Server",
      "key_hint": "un_live_...xxxx",
      "scopes": ["emails:send", "emails:read"],
      "created_at": "2024-01-15T10:30:00.000Z",
      "expires_at": "2025-12-31T23:59:59Z",
      "last_used_at": "2024-01-20T14:30:00.000Z"
    }
  ]
}`}
        />
      </section>

      {/* Delete API Key */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-50 text-red-700">DELETE</span>
          <code className="text-[14px] text-stone-700 font-mono">/v1/api-keys/:id</code>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Delete an API Key</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Permanently revoke an API key. Requests using this key will fail immediately.
        </p>

        <CodeBlock 
          filename="Node.js"
          code={`const { error } = await unosend.apiKeys.delete('key_xxxxxxxxxxxxxxxx');`}
        />

        <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-4">
          <p className="text-[13px] text-red-800">
            <strong>Warning:</strong> This action cannot be undone. Any applications using this key will stop working.
          </p>
        </div>
      </section>
    </div>
  )
}
