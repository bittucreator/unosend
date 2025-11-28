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

      {/* Basic Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Basic Usage</h2>
        <CodeBlock 
          filename="main.py"
          showLineNumbers
          code={`import os
from unosend import Unosend

# Initialize with your API key
unosend = Unosend(api_key=os.environ.get("UNOSEND_API_KEY"))

# Send an email
result = unosend.emails.send(
    from_email="hello@yourdomain.com",
    to=["user@example.com"],
    subject="Welcome!",
    html="<h1>Hello World</h1><p>Welcome to Unosend!</p>"
)

if result.error:
    print(f"Error: {result.error.message}")
else:
    print(f"Email sent! ID: {result.data.id}")`}
        />
      </section>

      {/* Async Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Async Support</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Use <InlineCode>AsyncUnosend</InlineCode> for async/await support:
        </p>
        <CodeBlock 
          filename="async_example.py"
          showLineNumbers
          code={`import asyncio
from unosend import AsyncUnosend

async def send_emails():
    unosend = AsyncUnosend(api_key="un_your_api_key")
    
    # Send multiple emails concurrently
    emails = [
        {"to": "user1@example.com", "subject": "Hello User 1"},
        {"to": "user2@example.com", "subject": "Hello User 2"},
        {"to": "user3@example.com", "subject": "Hello User 3"},
    ]
    
    tasks = [
        unosend.emails.send(
            from_email="hello@yourdomain.com",
            to=[email["to"]],
            subject=email["subject"],
            html="<p>Hello!</p>"
        )
        for email in emails
    ]
    
    results = await asyncio.gather(*tasks)
    
    for result in results:
        if result.data:
            print(f"Sent: {result.data.id}")

asyncio.run(send_emails())`}
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
from unosend import AsyncUnosend
import os

app = FastAPI()
unosend = AsyncUnosend(api_key=os.environ.get("UNOSEND_API_KEY"))

class EmailRequest(BaseModel):
    to: str
    subject: str
    html: str

@app.post("/send-email")
async def send_email(request: EmailRequest):
    result = await unosend.emails.send(
        from_email="hello@yourdomain.com",
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

unosend = Unosend(api_key=os.environ.get("UNOSEND_API_KEY"))

@csrf_exempt
@require_POST
def send_email(request):
    data = json.loads(request.body)
    
    result = unosend.emails.send(
        from_email="hello@yourdomain.com",
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
unosend = Unosend(api_key=os.environ.get("UNOSEND_API_KEY"))

@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.json
    
    result = unosend.emails.send(
        from_email="hello@yourdomain.com",
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
from unosend.exceptions import (
    UnosendError,
    RateLimitError,
    AuthenticationError,
    ValidationError
)

unosend = Unosend(api_key="un_your_api_key")

try:
    result = unosend.emails.send(
        from_email="hello@yourdomain.com",
        to=["user@example.com"],
        subject="Hello",
        html="<p>Hello</p>"
    )
except RateLimitError as e:
    print(f"Rate limited. Retry after: {e.retry_after} seconds")
except AuthenticationError:
    print("Invalid API key")
except ValidationError as e:
    print(f"Validation error: {e.message}")
except UnosendError as e:
    print(f"Error: {e.message}")`}
        />
      </section>

      {/* Available Methods */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Available Methods</h2>
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-50/80 border-b border-stone-100">
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
                <td className="px-4 py-3"><InlineCode>emails.get()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Get email details</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a domain</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.verify()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Verify domain DNS</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audiences.create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create an audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>contacts.create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a contact</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
