import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiKeysList } from '@/components/dashboard/api-keys-list'
import { CreateApiKeyButton } from '@/components/dashboard/create-api-key-button'
import { Copy, Terminal, Code } from 'lucide-react'

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, created_at')
    .eq('organization_id', membership.organization_id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your API keys for authentication
          </p>
        </div>
        <CreateApiKeyButton organizationId={membership.organization_id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Your API Keys</CardTitle>
          <CardDescription>
            API keys are used to authenticate requests. Keep them secure and never share publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeysList apiKeys={apiKeys || []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Usage Examples</CardTitle>
          </div>
          <CardDescription>
            Include your API key in the Authorization header
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
              <TabsTrigger value="node" className="text-xs">Node.js</TabsTrigger>
              <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl" className="mt-4">
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-foreground">
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
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-foreground">
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
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-foreground">
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
        </CardContent>
      </Card>
    </div>
  )
}
