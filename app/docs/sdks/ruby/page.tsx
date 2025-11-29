import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export default function RubySDKPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-red-50 text-red-700 border-0">
          SDK
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Ruby SDK</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          The official Ruby SDK for Unosend. Supports Ruby 3.0+ with idiomatic Ruby patterns.
        </p>
      </div>

      {/* Installation */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Installation</h2>
        <div className="space-y-3">
          <CodeBlock code="gem install unosend" filename="gem" />
          <CodeBlock code='gem "unosend"' filename="Gemfile" />
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Requirements</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[14px] text-muted-foreground">Ruby 2.7 or higher</span>
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
          filename="config.rb"
          showLineNumbers
          code={`require 'unosend'

client = Unosend::Client.new(ENV['UNOSEND_API_KEY'])`}
        />
      </section>

      {/* Basic Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Basic Usage</h2>
        <CodeBlock 
          filename="send_email.rb"
          showLineNumbers
          code={`require 'unosend'

# Initialize client
client = Unosend::Client.new('un_your_api_key')

# Send an email
begin
  email = client.emails.send(
    from: 'hello@yourdomain.com',
    to: 'user@example.com',  # Can be string or array
    subject: 'Welcome!',
    html: '<h1>Hello World</h1><p>Welcome to Unosend!</p>'
  )
  
  puts "Email sent! ID: #{email['id']}"
rescue Unosend::Error => e
  puts "Error: #{e.message}"
end`}
        />
      </section>

      {/* Response Format */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Response Format</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          SDK methods return Ruby hashes. Errors are raised as exceptions:
        </p>
        <CodeBlock 
          filename="response.rb"
          showLineNumbers
          code={`# Successful response (Hash)
email = client.emails.send(...)
email['id']        # => "em_xxxxxxxxxxxxxxxxxxxxxxxx"
email['from']      # => "hello@yourdomain.com"
email['to']        # => ["user@example.com"]
email['subject']   # => "Welcome!"
email['status']    # => "queued"
email['createdAt'] # => "2024-01-15T10:30:00Z"

# Errors are raised as exceptions
begin
  client.emails.send(...)
rescue Unosend::Error => e
  e.message     # => "Invalid API key"
  e.status_code # => 401
end`}
        />
      </section>

      {/* Sending with Attachments */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending with Attachments</h2>
        <CodeBlock 
          filename="attachments.rb"
          showLineNumbers
          code={`require 'unosend'
require 'base64'

client = Unosend::Client.new(ENV['UNOSEND_API_KEY'])

# Read file and encode as base64
file_content = Base64.strict_encode64(File.read('invoice.pdf'))

# Send email with attachment
email = client.emails.send(
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: file_content,
      content_type: 'application/pdf'
    }
  ]
)`}
        />
      </section>

      {/* Working with Domains */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Working with Domains</h2>
        <CodeBlock 
          filename="domains.rb"
          showLineNumbers
          code={`require 'unosend'

client = Unosend::Client.new(ENV['UNOSEND_API_KEY'])

# Add a domain
domain = client.domains.create(name: 'yourdomain.com')
puts "Domain added: #{domain['id']}"
puts "DNS Records: #{domain['records']}"

# List all domains
domains = client.domains.list
domains.each do |d|
  puts "#{d['name']} - #{d['status']}"
end

# Verify domain DNS
verified = client.domains.verify(domain['id'])
puts "Status: #{verified['status']}"

# Delete a domain
client.domains.delete(domain['id'])`}
        />
      </section>

      {/* Working with Audiences & Contacts */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Working with Audiences & Contacts</h2>
        <CodeBlock 
          filename="audiences.rb"
          showLineNumbers
          code={`require 'unosend'

client = Unosend::Client.new(ENV['UNOSEND_API_KEY'])

# Create an audience
audience = client.audiences.create(name: 'Newsletter Subscribers')
puts "Audience created: #{audience['id']}"

# Add a contact
contact = client.contacts.create(
  audience['id'],
  email: 'subscriber@example.com',
  first_name: 'John',
  last_name: 'Doe'
)
puts "Contact added: #{contact['id']}"

# List all contacts
contacts = client.contacts.list(audience['id'])
puts "Total subscribers: #{contacts.length}"

# List all audiences
audiences = client.audiences.list
audiences.each do |a|
  puts "#{a['name']}: #{a['contactCount']} contacts"
end`}
        />
      </section>

      {/* Configuration */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Configuration</h2>
        <CodeBlock 
          filename="config.rb"
          showLineNumbers
          code={`require 'unosend'

# Default configuration
client = Unosend::Client.new('un_your_api_key')

# Custom base URL (for self-hosted instances)
client = Unosend::Client.new(
  'un_your_api_key',
  base_url: 'https://your-instance.com/api/v1'
)`}
        />
      </section>

      {/* Framework Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Framework Examples</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Ruby on Rails</h3>
        <CodeBlock 
          filename="app/controllers/emails_controller.rb"
          showLineNumbers
          code={`class EmailsController < ApplicationController
  def create
    client = Unosend::Client.new(ENV['UNOSEND_API_KEY'])
    
    response = client.emails.send(
      from: 'hello@yourdomain.com',
      to: [params[:to]],
      subject: params[:subject],
      html: params[:html]
    )
    
    render json: { id: response['id'] }
  rescue Unosend::Error => e
    render json: { error: e.message }, status: :bad_request
  end
end`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Sinatra</h3>
        <CodeBlock 
          filename="app.rb"
          showLineNumbers
          code={`require 'sinatra'
require 'unosend'
require 'json'

client = Unosend::Client.new(ENV['UNOSEND_API_KEY'])

post '/send-email' do
  content_type :json
  data = JSON.parse(request.body.read)
  
  begin
    response = client.emails.send(
      from: 'hello@yourdomain.com',
      to: [data['to']],
      subject: data['subject'],
      html: data['html']
    )
    
    { id: response['id'] }.to_json
  rescue Unosend::Error => e
    status 400
    { error: e.message }.to_json
  end
end`}
        />
      </section>

      {/* Error Handling */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Handling</h2>
        <CodeBlock 
          filename="errors.rb"
          showLineNumbers
          code={`require 'unosend'

client = Unosend::Client.new('un_your_api_key')

begin
  response = client.emails.send(
    from: 'hello@yourdomain.com',
    to: ['user@example.com'],
    subject: 'Hello',
    html: '<p>Hello</p>'
  )
  
  puts "Email sent: #{response['id']}"
rescue Unosend::Error => e
  puts "Error: #{e.message}"
  puts "Status code: #{e.status_code}"
end`}
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
                <td className="px-4 py-3"><InlineCode>emails.send(params)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Send an email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>emails.get(id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Get email by ID</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>emails.list(limit:, offset:)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all emails</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.create(name:)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a domain</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.verify(id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Verify domain DNS</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>domains.list</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all domains</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audiences.create(name:)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create an audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>audiences.list</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all audiences</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>contacts.create(audience_id, params)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a contact</td>
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
