import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiKeysList } from '@/components/dashboard/api-keys-list'
import { CreateApiKeyButton } from '@/components/dashboard/create-api-key-button'
import { Code } from 'lucide-react'

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  const organizationId = membership?.organization_id

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, expires_at, created_at')
    .eq('organization_id', organizationId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">API Keys</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Manage your API keys for authentication
          </p>
        </div>
        <CreateApiKeyButton organizationId={organizationId} />
      </div>

      {/* API Keys Section */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Code className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">All API Keys</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {apiKeys?.length || 0} active key{(apiKeys?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          <ApiKeysList apiKeys={apiKeys || []} />
        </div>
      </div>

      {/* Usage Examples Section */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-stone-100">
          <Code className="w-4 h-4 text-muted-foreground" />
          <div>
            <h2 className="font-semibold text-[15px]">Usage Examples</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Include your API key in the Authorization header
            </p>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="bg-stone-100 p-0.5">
              <TabsTrigger value="curl" className="text-[13px] data-[state=active]:bg-white">cURL</TabsTrigger>
              <TabsTrigger value="node" className="text-[13px] data-[state=active]:bg-white">Node.js</TabsTrigger>
              <TabsTrigger value="python" className="text-[13px] data-[state=active]:bg-white">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl" className="mt-4">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 font-mono text-[13px] overflow-x-auto">
                <pre className="text-stone-800">
{`curl -X POST https://api.unosend.co/v1/emails \\
  -H "Authorization: Bearer un_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@yourdomain.com",
    "to": "user@example.com",
    "subject": "Hello World",
    "html": "<p>Welcome!</p>"
  }'`}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="node" className="mt-4">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 font-mono text-[13px] overflow-x-auto">
                <pre className="text-stone-800">
{`const response = await fetch('https://api.unosend.co/v1/emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer un_your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Hello World',
    html: '<p>Welcome!</p>'
  })
});

const data = await response.json();
console.log(data);`}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 font-mono text-[13px] overflow-x-auto">
                <pre className="text-stone-800">
{`import requests

response = requests.post(
    'https://api.unosend.co/v1/emails',
    headers={
        'Authorization': 'Bearer un_your_api_key',
        'Content-Type': 'application/json'
    },
    json={
        'from': 'hello@yourdomain.com',
        'to': 'user@example.com',
        'subject': 'Hello World',
        'html': '<p>Welcome!</p>'
    }
)

print(response.json())`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
