import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export default function PythonSDKPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-yellow-50 text-yellow-700 border-0">
          SDK
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Python SDK</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          The official Python SDK for Unosend. Supports Python 3.8+ with full 
          type hints and async support.
        </p>
      </div>

      {/* Installation */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Installation</h2>
        <div className="space-y-3">
          <CodeBlock code="pip install unosend" filename="pip" />
          <CodeBlock code="poetry add unosend" filename="poetry" />
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Requirements</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[14px] text-muted-foreground">Python 3.8 or higher</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[14px] text-muted-foreground">httpx (installed automatically)</span>
          </li>
        </ul>
      </section>

      {/* Environment Variables */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Environment Variables</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Never hardcode your API key. Use environment variables instead:
        </p>
        <CodeBlock 
          filename=".env"
          code={`UNOSEND_API_KEY=un_your_api_key`}
        />
        <CodeBlock 
          filename="main.py"
          showLineNumbers
          code={`import os
from unosend import Unosend

unosend = Unosend(os.environ.get("UNOSEND_API_KEY"))`}
        />
      </section>

      {/* Basic Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Basic Usage</h2>
        <CodeBlock 
          filename="main.py"
          showLineNumbers
          code={`from unosend import Unosend

# Initialize with your API key
unosend = Unosend("un_your_api_key")

# Send an email
response = unosend.emails.send(
    from_address="hello@yourdomain.com",
    to="user@example.com",  # Can be string or list
    subject="Welcome!",
    html="<h1>Hello World</h1><p>Welcome to Unosend!</p>"
)

if response.error:
    print(f"Error: {response.error.message}")
else:
    print(f"Email sent! ID: {response.data.id}")`}
        />
      </section>

      {/* Response Format */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Response Format</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          All SDK methods return an <InlineCode>ApiResponse</InlineCode> object with <InlineCode>data</InlineCode> and <InlineCode>error</InlineCode> attributes:
        </p>
        <CodeBlock 
          filename="response_example.py"
          showLineNumbers
          code={`# Successful response
response = unosend.emails.send(...)
print(response.data.id)        # "em_xxxxxxxxxxxxxxxxxxxxxxxx"
print(response.data.from)      # "hello@yourdomain.com"
print(response.data.to)        # ["user@example.com"]
print(response.data.subject)   # "Welcome!"
print(response.data.status)    # "queued"
print(response.error)          # None

# Error response
response = unosend.emails.send(...)
print(response.data)           # None
print(response.error.message)  # "Invalid API key"
print(response.error.status_code)  # 401

# Tuple unpacking also works
data, error = unosend.emails.send(...)`}
        />
      </section>

      {/* Sending with Attachments */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending with Attachments</h2>
        <CodeBlock 
          filename="attachments.py"
          showLineNumbers
          code={`import base64
from unosend import Unosend

unosend = Unosend(os.environ.get("UNOSEND_API_KEY"))

# Read file and encode as base64
with open("invoice.pdf", "rb") as f:
    file_content = base64.b64encode(f.read()).decode()

# Send email with attachment
response = unosend.emails.send(
    from_address="hello@yourdomain.com",
    to=["user@example.com"],
    subject="Your Invoice",
    html="<p>Please find your invoice attached.</p>",
    attachments=[
        {
            "filename": "invoice.pdf",
            "content": file_content,
            "content_type": "application/pdf"
        }
    ]
)`}
        />
      </section>

      {/* Working with Domains */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Working with Domains</h2>
        <CodeBlock 
          filename="domains.py"
          showLineNumbers
          code={`from unosend import Unosend

unosend = Unosend(os.environ.get("UNOSEND_API_KEY"))

# Add a domain
result = unosend.domains.create("yourdomain.com")
print(f"Domain added: {result.data.id}")
print(f"DNS Records to add: {result.data.records}")

# List all domains
result = unosend.domains.list()
for domain in result.data:
    print(f"{domain.name} - {domain.status}")

# Verify domain DNS
result = unosend.domains.verify(domain_id)
print(f"Domain status: {result.data.status}")

# Delete a domain
unosend.domains.delete(domain_id)`}
        />
      </section>

      {/* Working with Audiences & Contacts */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Working with Audiences & Contacts</h2>
        <CodeBlock 
          filename="audiences.py"
          showLineNumbers
          code={`from unosend import Unosend

unosend = Unosend(os.environ.get("UNOSEND_API_KEY"))

# Create an audience
result = unosend.audiences.create("Newsletter Subscribers")
audience_id = result.data.id
print(f"Audience created: {audience_id}")

# Add a contact to the audience
result = unosend.contacts.create(
    audience_id,
    email="subscriber@example.com",
    first_name="John",
    last_name="Doe"
)
print(f"Contact added: {result.data.id}")

# List all contacts in an audience
result = unosend.contacts.list(audience_id)
print(f"Total subscribers: {len(result.data)}")

# List all audiences
result = unosend.audiences.list()
for audience in result.data:
    print(f"{audience.name}: {audience.contact_count} contacts")`}
        />
      </section>

      {/* Additional Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Additional Examples</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Send emails with additional options:
        </p>
        <CodeBlock 
          filename="advanced_example.py"
          showLineNumbers
          code={`from unosend import Unosend

unosend = Unosend("un_your_api_key")

# Send with CC, BCC, and custom headers
result = unosend.emails.send(
    from_address="hello@yourdomain.com",
    to=["user@example.com"],
    subject="Welcome to our platform",
    html="<h1>Welcome!</h1><p>Thanks for signing up.</p>",
    text="Welcome! Thanks for signing up.",
    reply_to="support@yourdomain.com",
    cc=["manager@yourdomain.com"],
    bcc=["archive@yourdomain.com"],
    headers={
        "X-Custom-Header": "custom-value"
    },
    tags=[
        {"name": "category", "value": "welcome"}
    ]
)

if result.data:
    print(f"Email sent: {result.data.id}")
else:
    print(f"Error: {result.error.message}")`}
        />
      </section>

      {/* Framework Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Framework Examples</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">FastAPI</h3>
        <CodeBlock 
          filename="app.py"
          showLineNumbers
          code={`from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from unosend import Unosend
import os

app = FastAPI()
unosend = Unosend(os.environ.get("UNOSEND_API_KEY"))

class EmailRequest(BaseModel):
    to: str
    subject: str
    html: str

@app.post("/send-email")
def send_email(request: EmailRequest):
    result = unosend.emails.send(
        from_address="hello@yourdomain.com",
        to=[request.to],
        subject=request.subject,
        html=request.html
    )
    
    if result.error:
        raise HTTPException(status_code=400, detail=result.error.message)
    
    return {"id": result.data.id}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Django</h3>
        <CodeBlock 
          filename="views.py"
          showLineNumbers
          code={`from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from unosend import Unosend
import json
import os

unosend = Unosend(os.environ.get("UNOSEND_API_KEY"))

@csrf_exempt
@require_POST
def send_email(request):
    data = json.loads(request.body)
    
    result = unosend.emails.send(
        from_address="hello@yourdomain.com",
        to=[data["to"]],
        subject=data["subject"],
        html=data["html"]
    )
    
    if result.error:
        return JsonResponse({"error": result.error.message}, status=400)
    
    return JsonResponse({"id": result.data.id})`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Flask</h3>
        <CodeBlock 
          filename="app.py"
          showLineNumbers
          code={`from flask import Flask, request, jsonify
from unosend import Unosend
import os

app = Flask(__name__)
unosend = Unosend(os.environ.get("UNOSEND_API_KEY"))

@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.json
    
    result = unosend.emails.send(
        from_address="hello@yourdomain.com",
        to=[data["to"]],
        subject=data["subject"],
        html=data["html"]
    )
    
    if result.error:
        return jsonify({"error": result.error.message}), 400
    
    return jsonify({"id": result.data.id})`}
        />
      </section>

      {/* Error Handling */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Handling</h2>
        <CodeBlock 
          filename="errors.py"
          showLineNumbers
          code={`from unosend import Unosend

unosend = Unosend("un_your_api_key")

# Using data/error pattern
result = unosend.emails.send(
    from_address="hello@yourdomain.com",
    to=["user@example.com"],
    subject="Hello",
    html="<p>Hello</p>"
)

if result.error:
    print(f"Error: {result.error.message}")
    print(f"Status code: {result.error.status_code}")
else:
    print(f"Email sent! ID: {result.data.id}")

# Unpacking syntax
data, error = unosend.emails.send(
    from_address="hello@yourdomain.com",
    to=["user@example.com"],
    subject="Hello",
    html="<p>Hello</p>"
)

if error:
    print(f"Failed: {error.message}")
else:
    print(f"Success: {data.id}")`}
        />
      </section>

      {/* Available Methods */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Available Methods</h2>
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Method</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-3"><InlineCode>emails.send()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Send an email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>emails.get(id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Get email details by ID</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>emails.list()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all emails</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.create(name)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a domain</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.verify(id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Verify domain DNS</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.list()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all domains</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audiences.create(name)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create an audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audiences.list()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all audiences</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>contacts.create(audience_id, data)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a contact to audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>contacts.list(audience_id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List contacts in audience</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
