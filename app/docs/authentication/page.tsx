import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Key, Lock } from 'lucide-react'

export default function AuthenticationPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-purple-50 text-purple-700 border-0">
          Security
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Authentication</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Learn how to authenticate your API requests using API keys and best practices 
          for keeping your keys secure.
        </p>
      </div>

      {/* API Keys */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">API Keys</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Unosend uses API keys to authenticate requests. You can create and manage API keys in your 
          dashboard under <strong>Settings → API Keys</strong>.
        </p>
        
        <div className="bg-white border border-stone-200 rounded-xl p-5 mb-4">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[14px] font-semibold text-stone-900 mb-1">API Key Format</h3>
              <p className="text-[13px] text-muted-foreground mb-3">
                All Unosend API keys are prefixed with <InlineCode>un_</InlineCode> for easy identification:
              </p>
              <CodeBlock code="un_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Header */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Using the Authorization Header</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Include your API key in the <InlineCode>Authorization</InlineCode> header as a Bearer token:
        </p>
        
        <CodeBlock 
          filename="HTTP Header"
          code="Authorization: Bearer un_live_your_api_key"
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Example Request</h3>
        
        <CodeBlock 
          filename="cURL"
          showLineNumbers
          code={`curl -X POST https://api.unosend.com/v1/emails \\
  -H "Authorization: Bearer un_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@yourdomain.com",
    "to": ["recipient@example.com"],
    "subject": "Hello World"
  }'`}
        />
      </section>

      {/* SDK Authentication */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">SDK Authentication</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          When using our SDKs, pass your API key when initializing the client:
        </p>
        
        <div className="space-y-4">
          <CodeBlock 
            filename="Node.js"
            showLineNumbers
            code={`import { Unosend } from '@unosend/node';

const unosend = new Unosend('un_live_your_api_key');

// Or use environment variables (recommended)
const unosend = new Unosend(process.env.UNOSEND_API_KEY);`}
          />
          
          <CodeBlock 
            filename="Python"
            showLineNumbers
            code={`from unosend import Unosend

unosend = Unosend("un_live_your_api_key")

# Or use environment variables (recommended)
import os
unosend = Unosend(os.environ.get("UNOSEND_API_KEY"))`}
          />
          
          <CodeBlock 
            filename="Go"
            showLineNumbers
            code={`import (
    "os"
    unosend "github.com/unosend/unosend-go"
)

client := unosend.New("un_live_your_api_key")

// Or use environment variables (recommended)
client := unosend.New(os.Getenv("UNOSEND_API_KEY"))`}
          />
        </div>
      </section>

      {/* API Key Types */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">API Key Types</h2>
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-green-700" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-stone-900 mb-1">
                  Live Keys <Badge className="ml-2 text-[10px] bg-green-50 text-green-700 border-0">Production</Badge>
                </h3>
                <p className="text-[13px] text-muted-foreground">
                  Use live keys in production. Emails sent with live keys are delivered to real recipients. 
                  Prefixed with <InlineCode>un_live_</InlineCode>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-stone-900 mb-1">
                  Test Keys <Badge className="ml-2 text-[10px] bg-amber-50 text-amber-700 border-0">Development</Badge>
                </h3>
                <p className="text-[13px] text-muted-foreground">
                  Use test keys during development. Emails are simulated and not actually sent. 
                  Prefixed with <InlineCode>un_test_</InlineCode>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Permissions */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Key Permissions</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          You can create API keys with limited permissions for security. Available scopes:
        </p>
        
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
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
                <td className="px-4 py-3 text-muted-foreground">Read email status and details</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains:manage</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add and verify domains</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audiences:manage</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Manage audiences and contacts</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>webhooks:manage</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create and manage webhooks</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>full_access</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Full access to all resources</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Security Best Practices</h2>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[14px] font-semibold text-amber-900 mb-2">Keep your API keys secure</h3>
                <ul className="space-y-2 text-[13px] text-amber-800">
                  <li>• Never expose API keys in client-side code (frontend)</li>
                  <li>• Store keys in environment variables, not in code</li>
                  <li>• Don&apos;t commit API keys to version control</li>
                  <li>• Use different keys for development and production</li>
                  <li>• Rotate keys regularly and revoke unused keys</li>
                  <li>• Use keys with minimal required permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Environment Variables */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Using Environment Variables</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Store your API key in an environment variable for security:
        </p>
        
        <CodeBlock 
          filename=".env.local"
          code="UNOSEND_API_KEY=un_live_your_api_key"
        />
        
        <p className="text-[14px] text-muted-foreground mt-4 mb-4">
          Add <InlineCode>.env.local</InlineCode> to your <InlineCode>.gitignore</InlineCode>:
        </p>
        
        <CodeBlock 
          filename=".gitignore"
          code={`.env.local
.env*.local`}
        />
      </section>

      {/* Error Responses */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Authentication Errors</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          If authentication fails, you&apos;ll receive one of these error responses:
        </p>
        
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50">
              <span className="text-[12px] font-medium text-red-600">401 Unauthorized</span>
            </div>
            <div className="p-4">
              <CodeBlock 
                code={`{
  "error": {
    "code": "unauthorized",
    "message": "Missing or invalid API key"
  }
}`}
              />
            </div>
          </div>
          
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50">
              <span className="text-[12px] font-medium text-red-600">403 Forbidden</span>
            </div>
            <div className="p-4">
              <CodeBlock 
                code={`{
  "error": {
    "code": "forbidden",
    "message": "API key does not have required permissions"
  }
}`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
