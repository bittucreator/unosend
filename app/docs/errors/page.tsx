import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, XCircle, HelpCircle } from 'lucide-react'

export default function ErrorsPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-red-50 text-red-700 border-0">
          Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Error Codes</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Complete reference of error codes returned by the Unosend API and how to handle them.
        </p>
      </div>

      {/* Error Format */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Response Format</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          When an error occurs, the API returns a JSON response with the following structure:
        </p>
        
        <CodeBlock 
          filename="error-response.json"
          showLineNumbers
          code={`{
  "error": {
    "code": "invalid_api_key",
    "message": "The API key provided is invalid or has been revoked.",
    "status": 401,
    "details": {
      "api_key_prefix": "un_xxx..."
    }
  }
}`}
        />
        
        <div className="mt-4 bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Field</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>code</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Machine-readable error identifier</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>message</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Human-readable error description</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>status</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">HTTP status code</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>details</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Additional context (optional)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* HTTP Status Codes */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">HTTP Status Codes</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-4">
            <div className="px-2 py-1 bg-green-100 rounded text-green-700 font-mono text-[12px] shrink-0">
              2xx
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-stone-900">Success</h3>
              <p className="text-[13px] text-muted-foreground">Request was successful</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-4">
            <div className="px-2 py-1 bg-amber-100 rounded text-amber-700 font-mono text-[12px] shrink-0">
              4xx
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-stone-900">Client Error</h3>
              <p className="text-[13px] text-muted-foreground">Something was wrong with the request</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-4">
            <div className="px-2 py-1 bg-red-100 rounded text-red-700 font-mono text-[12px] shrink-0">
              5xx
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-stone-900">Server Error</h3>
              <p className="text-[13px] text-muted-foreground">Something went wrong on our end</p>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Errors */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Authentication Errors
        </h2>
        
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>missing_api_key</InlineCode></td>
                <td className="px-4 py-3">401</td>
                <td className="px-4 py-3 text-muted-foreground">No API key provided in request</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>invalid_api_key</InlineCode></td>
                <td className="px-4 py-3">401</td>
                <td className="px-4 py-3 text-muted-foreground">API key is invalid or revoked</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>api_key_expired</InlineCode></td>
                <td className="px-4 py-3">401</td>
                <td className="px-4 py-3 text-muted-foreground">API key has expired</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>insufficient_permissions</InlineCode></td>
                <td className="px-4 py-3">403</td>
                <td className="px-4 py-3 text-muted-foreground">API key lacks required permissions</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">How to Fix</h3>
        <CodeBlock 
          filename="authentication.ts"
          showLineNumbers
          code={`// Make sure to include the API key in the Authorization header
const response = await fetch('https://api.unosend.com/v1/emails', {
  method: 'POST',
  headers: {
    // Correct format: Bearer un_xxxxxxxxx
    'Authorization': \`Bearer \${process.env.UNOSEND_API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(emailData)
});`}
        />
      </section>

      {/* Validation Errors */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Validation Errors
        </h2>
        
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>validation_error</InlineCode></td>
                <td className="px-4 py-3">400</td>
                <td className="px-4 py-3 text-muted-foreground">Request body failed validation</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>missing_required_field</InlineCode></td>
                <td className="px-4 py-3">400</td>
                <td className="px-4 py-3 text-muted-foreground">Required field is missing</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>invalid_email_address</InlineCode></td>
                <td className="px-4 py-3">400</td>
                <td className="px-4 py-3 text-muted-foreground">Email address format is invalid</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>invalid_from_address</InlineCode></td>
                <td className="px-4 py-3">400</td>
                <td className="px-4 py-3 text-muted-foreground">From address domain not verified</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>invalid_template_variables</InlineCode></td>
                <td className="px-4 py-3">400</td>
                <td className="px-4 py-3 text-muted-foreground">Template variables don&apos;t match schema</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Example Validation Error</h3>
        <CodeBlock 
          filename="validation-error.json"
          showLineNumbers
          code={`{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "status": 400,
    "details": {
      "errors": [
        {
          "field": "to",
          "message": "must be a valid email address",
          "value": "not-an-email"
        },
        {
          "field": "subject",
          "message": "is required",
          "value": null
        }
      ]
    }
  }
}`}
        />
      </section>

      {/* Resource Errors */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          Resource Errors
        </h2>
        
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>not_found</InlineCode></td>
                <td className="px-4 py-3">404</td>
                <td className="px-4 py-3 text-muted-foreground">Resource doesn&apos;t exist</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>email_not_found</InlineCode></td>
                <td className="px-4 py-3">404</td>
                <td className="px-4 py-3 text-muted-foreground">Email ID not found</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domain_not_found</InlineCode></td>
                <td className="px-4 py-3">404</td>
                <td className="px-4 py-3 text-muted-foreground">Domain not found in workspace</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>template_not_found</InlineCode></td>
                <td className="px-4 py-3">404</td>
                <td className="px-4 py-3 text-muted-foreground">Template ID not found</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audience_not_found</InlineCode></td>
                <td className="px-4 py-3">404</td>
                <td className="px-4 py-3 text-muted-foreground">Audience not found</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>contact_not_found</InlineCode></td>
                <td className="px-4 py-3">404</td>
                <td className="px-4 py-3 text-muted-foreground">Contact not found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate Limit Errors */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Rate Limit Errors
        </h2>
        
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>rate_limit_exceeded</InlineCode></td>
                <td className="px-4 py-3">429</td>
                <td className="px-4 py-3 text-muted-foreground">Too many requests</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>daily_limit_exceeded</InlineCode></td>
                <td className="px-4 py-3">429</td>
                <td className="px-4 py-3 text-muted-foreground">Daily email limit reached</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>quota_exceeded</InlineCode></td>
                <td className="px-4 py-3">429</td>
                <td className="px-4 py-3 text-muted-foreground">Monthly quota exceeded</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
          <p className="text-[13px] text-amber-800">
            See the <a href="/docs/rate-limits" className="underline font-medium">Rate Limits</a> documentation 
            for handling strategies.
          </p>
        </div>
      </section>

      {/* Server Errors */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          Server Errors
        </h2>
        
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>internal_server_error</InlineCode></td>
                <td className="px-4 py-3">500</td>
                <td className="px-4 py-3 text-muted-foreground">Unexpected server error</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>service_unavailable</InlineCode></td>
                <td className="px-4 py-3">503</td>
                <td className="px-4 py-3 text-muted-foreground">Service temporarily unavailable</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>gateway_timeout</InlineCode></td>
                <td className="px-4 py-3">504</td>
                <td className="px-4 py-3 text-muted-foreground">Request timed out</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-[13px] text-blue-800">
            <strong>5xx errors</strong> are rare and usually temporary. Implement retry logic 
            with exponential backoff for these errors.
          </p>
        </div>
      </section>

      {/* Error Handling */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Handling Example</h2>
        
        <CodeBlock 
          filename="error-handling.ts"
          showLineNumbers
          code={`async function sendEmail(payload: EmailPayload) {
  try {
    const response = await fetch('https://api.unosend.com/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (error.error.code) {
        case 'invalid_api_key':
          throw new Error('Please check your API key');
          
        case 'validation_error':
          console.error('Validation errors:', error.error.details.errors);
          throw new Error('Invalid email data');
          
        case 'rate_limit_exceeded':
          const retryAfter = error.error.retry_after || 60;
          console.log(\`Rate limited. Retry after \${retryAfter}s\`);
          // Implement retry logic
          break;
          
        case 'domain_not_found':
          throw new Error('Verify your domain first');
          
        case 'internal_server_error':
          // Retry with exponential backoff
          console.error('Server error, retrying...');
          break;
          
        default:
          throw new Error(error.error.message);
      }
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}`}
        />
      </section>
    </div>
  )
}
