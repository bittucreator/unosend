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
            <span className="text-[14px] text-muted-foreground">Ruby 3.0 or higher</span>
          </li>
        </ul>
      </section>

      {/* Basic Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Basic Usage</h2>
        <CodeBlock 
          filename="send_email.rb"
          showLineNumbers
          code={`require 'unosend'

# Initialize client
client = Unosend::Client.new(api_key: ENV['UNOSEND_API_KEY'])

# Send an email
begin
  response = client.emails.send(
    from: 'hello@yourdomain.com',
    to: ['user@example.com'],
    subject: 'Welcome!',
    html: '<h1>Hello World</h1><p>Welcome to Unosend!</p>'
  )
  
  puts "Email sent! ID: #{response.id}"
rescue Unosend::Error => e
  puts "Error: #{e.message}"
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

# Global configuration
Unosend.configure do |config|
  config.api_key = ENV['UNOSEND_API_KEY']
  config.timeout = 30
  config.retries = 3
end

# Or per-client configuration
client = Unosend::Client.new(
  api_key: ENV['UNOSEND_API_KEY'],
  timeout: 30,
  retries: 3
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
    client = Unosend::Client.new(api_key: ENV['UNOSEND_API_KEY'])
    
    response = client.emails.send(
      from: 'hello@yourdomain.com',
      to: [params[:to]],
      subject: params[:subject],
      html: params[:html]
    )
    
    render json: { id: response.id }
  rescue Unosend::Error => e
    render json: { error: e.message }, status: :bad_request
  end
end`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Rails Mailer Integration</h3>
        <CodeBlock 
          filename="config/initializers/unosend.rb"
          showLineNumbers
          code={`# config/initializers/unosend.rb
Unosend.configure do |config|
  config.api_key = ENV['UNOSEND_API_KEY']
end`}
        />

        <CodeBlock 
          filename="app/mailers/user_mailer.rb"
          showLineNumbers
          code={`class UserMailer < ApplicationMailer
  def welcome_email(user)
    client = Unosend::Client.new
    
    client.emails.send(
      from: 'hello@yourdomain.com',
      to: [user.email],
      subject: "Welcome, #{user.name}!",
      html: render_to_string(
        template: 'user_mailer/welcome_email',
        locals: { user: user }
      )
    )
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

client = Unosend::Client.new(api_key: ENV['UNOSEND_API_KEY'])

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
    
    { id: response.id }.to_json
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

client = Unosend::Client.new(api_key: 'un_your_api_key')

begin
  response = client.emails.send(
    from: 'hello@yourdomain.com',
    to: ['user@example.com'],
    subject: 'Hello',
    html: '<p>Hello</p>'
  )
  
  puts "Email sent: #{response.id}"
rescue Unosend::RateLimitError => e
  puts "Rate limited. Retry after: #{e.retry_after} seconds"
rescue Unosend::AuthenticationError
  puts "Invalid API key"
rescue Unosend::ValidationError => e
  puts "Validation error: #{e.message}"
rescue Unosend::Error => e
  puts "Error: #{e.message}"
end`}
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
                <td className="px-4 py-3"><InlineCode>client.emails.send</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Send an email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>client.emails.get</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Get email details</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>client.domains.create</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a domain</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>client.domains.verify</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Verify domain DNS</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>client.audiences.create</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create an audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>client.contacts.create</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a contact</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
