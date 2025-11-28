import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Timer, TrendingUp } from 'lucide-react'

export default function RateLimitsPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-amber-50 text-amber-700 border-0">
          Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Rate Limits</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Understanding API rate limits and how to handle them in your applications.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Overview</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Rate limits protect the API from abuse and ensure fair usage for all users. 
          Limits are applied per API key and vary by plan.
        </p>
        
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50/80 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Requests/Second</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Emails/Day</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Burst Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3 font-medium">Free</td>
                <td className="px-4 py-3">10 req/s</td>
                <td className="px-4 py-3">100 emails</td>
                <td className="px-4 py-3">20 requests</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Starter</td>
                <td className="px-4 py-3">50 req/s</td>
                <td className="px-4 py-3">10,000 emails</td>
                <td className="px-4 py-3">100 requests</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Pro</td>
                <td className="px-4 py-3">200 req/s</td>
                <td className="px-4 py-3">100,000 emails</td>
                <td className="px-4 py-3">500 requests</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Enterprise</td>
                <td className="px-4 py-3">Custom</td>
                <td className="px-4 py-3">Unlimited</td>
                <td className="px-4 py-3">Custom</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate Limit Headers */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Rate Limit Headers</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Every API response includes headers to help you track your rate limit status:
        </p>
        
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50/80 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Header</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>X-RateLimit-Limit</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Maximum requests allowed per window</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>X-RateLimit-Remaining</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Requests remaining in current window</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>X-RateLimit-Reset</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Unix timestamp when window resets</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Retry-After</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Seconds to wait (only on 429 response)</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Example Response Headers</h3>
        <CodeBlock 
          filename="response-headers.txt"
          code={`HTTP/1.1 200 OK
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 150
X-RateLimit-Reset: 1705320000
Content-Type: application/json`}
        />
      </section>

      {/* Handling Rate Limits */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Handling Rate Limits</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          When you exceed the rate limit, the API returns a <InlineCode>429 Too Many Requests</InlineCode> response:
        </p>
        
        <CodeBlock 
          filename="rate-limit-response.json"
          showLineNumbers
          code={`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after 60 seconds.",
    "retry_after": 60
  }
}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Implementing Retry Logic</h3>
        <CodeBlock 
          filename="retry-logic.ts"
          showLineNumbers
          code={`async function sendEmailWithRetry(
  payload: EmailPayload,
  maxRetries: number = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch('https://api.unosend.com/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.status === 429) {
      const retryAfter = parseInt(
        response.headers.get('Retry-After') || '60'
      );
      console.log(\`Rate limited. Waiting \${retryAfter} seconds...\`);
      await sleep(retryAfter * 1000);
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}`}
        />
      </section>

      {/* Exponential Backoff */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Exponential Backoff</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          For robust retry logic, use exponential backoff with jitter:
        </p>
        
        <CodeBlock 
          filename="exponential-backoff.ts"
          showLineNumbers
          code={`async function sendWithExponentialBackoff(
  payload: EmailPayload,
  maxRetries: number = 5
): Promise<Response> {
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.unosend.com/v1/emails', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.status === 429) {
        // Calculate delay with exponential backoff + jitter
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000;
        const waitTime = delay + jitter;
        
        console.log(\`Rate limited. Waiting \${waitTime}ms (attempt \${attempt + 1})\`);
        await sleep(waitTime);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }
      
      return response;
      
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw new Error('Max retries exceeded');
}`}
        />
      </section>

      {/* Queue Pattern */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          <Timer className="w-5 h-5 inline mr-2" />
          Queue Pattern for Bulk Sending
        </h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          For sending many emails, use a queue with rate limiting:
        </p>
        
        <CodeBlock 
          filename="rate-limited-queue.ts"
          showLineNumbers
          code={`class RateLimitedQueue {
  private queue: EmailPayload[] = [];
  private processing = false;
  private requestsPerSecond: number;
  
  constructor(requestsPerSecond: number = 10) {
    this.requestsPerSecond = requestsPerSecond;
  }
  
  async add(payload: EmailPayload): Promise<void> {
    this.queue.push(payload);
    this.process();
  }
  
  private async process(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    
    const interval = 1000 / this.requestsPerSecond;
    
    while (this.queue.length > 0) {
      const payload = this.queue.shift()!;
      
      try {
        await sendEmailWithRetry(payload);
      } catch (error) {
        console.error('Failed to send email:', error);
      }
      
      await sleep(interval);
    }
    
    this.processing = false;
  }
}

// Usage
const queue = new RateLimitedQueue(10); // 10 req/sec

for (const recipient of recipients) {
  queue.add({
    from: 'hello@yourdomain.com',
    to: recipient.email,
    subject: 'Hello!',
    html: '<p>Your email content</p>'
  });
}`}
        />
      </section>

      {/* Best Practices */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          <TrendingUp className="w-5 h-5 inline mr-2" />
          Best Practices
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-white border border-stone-200/60 rounded-xl p-4">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-blue-600">1</span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-stone-900">Monitor rate limit headers</h3>
              <p className="text-[13px] text-muted-foreground">
                Check <InlineCode>X-RateLimit-Remaining</InlineCode> and slow down before hitting limits.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-white border border-stone-200/60 rounded-xl p-4">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-blue-600">2</span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-stone-900">Use batch endpoints</h3>
              <p className="text-[13px] text-muted-foreground">
                Send multiple emails in one request using <InlineCode>/v1/emails/batch</InlineCode> to reduce API calls.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-white border border-stone-200/60 rounded-xl p-4">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-blue-600">3</span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-stone-900">Implement queuing</h3>
              <p className="text-[13px] text-muted-foreground">
                Queue emails during high-traffic periods and process them at a controlled rate.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-white border border-stone-200/60 rounded-xl p-4">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-blue-600">4</span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-stone-900">Use webhooks</h3>
              <p className="text-[13px] text-muted-foreground">
                Instead of polling for status, use webhooks to receive delivery updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Need Higher Limits */}
      <section>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <h3 className="text-[15px] font-semibold text-blue-900">Need Higher Limits?</h3>
          </div>
          <p className="text-[13px] text-blue-800 mb-4">
            If you need higher rate limits for your use case, upgrade your plan or contact us for Enterprise options with custom limits.
          </p>
          <a href="mailto:support@unosend.com" className="text-[13px] font-medium text-blue-600 hover:text-blue-700">
            Contact Sales →
          </a>
        </div>
      </section>
    </div>
  )
}
