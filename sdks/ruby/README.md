# unosend

Official Ruby SDK for [Unosend](https://unosend.com) - Email API Service.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'unosend'
```

And then execute:

```bash
bundle install
```

Or install it directly:

```bash
gem install unosend
```

## Quick Start

```ruby
require 'unosend'

client = Unosend::Client.new('un_your_api_key')

# Send an email
email = client.emails.send(
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello from Unosend!',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>'
)

puts "Email sent: #{email['id']}"
```

## Features

- 📧 **Emails** - Send transactional emails with HTML/text content
- 🌐 **Domains** - Manage and verify sending domains
- 👥 **Audiences** - Create and manage contact lists
- 📇 **Contacts** - Add, update, and remove contacts

## API Reference

### Emails

```ruby
# Send an email
email = client.emails.send(
  from: 'you@yourdomain.com',
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Hello!',
  html: '<h1>Hello World</h1>',
  text: 'Hello World',  # Optional
  reply_to: 'support@yourdomain.com',
  cc: ['cc@example.com'],
  bcc: ['bcc@example.com'],
  headers: { 'X-Custom-Header' => 'value' },
  tags: [{ name: 'campaign', value: 'welcome' }]
)

# Get email by ID
email = client.emails.get('email_id')

# List emails
emails = client.emails.list(limit: 10, offset: 0)
```

### Domains

```ruby
# Add a domain
domain = client.domains.create('yourdomain.com')

# Verify domain DNS records
domain = client.domains.verify('domain_id')

# List domains
domains = client.domains.list

# Delete domain
client.domains.delete('domain_id')
```

### Audiences

```ruby
# Create an audience
audience = client.audiences.create('Newsletter Subscribers')

# List audiences
audiences = client.audiences.list

# Get audience
audience = client.audiences.get('audience_id')

# Delete audience
client.audiences.delete('audience_id')
```

### Contacts

```ruby
# Add a contact
contact = client.contacts.create(
  audience_id: 'audience_id',
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe'
)

# List contacts in an audience
contacts = client.contacts.list('audience_id')

# Update a contact
contact = client.contacts.update('contact_id',
  first_name: 'Jane',
  unsubscribed: false
)

# Delete a contact
client.contacts.delete('contact_id')
```

## Error Handling

```ruby
begin
  email = client.emails.send(...)
rescue Unosend::Error => e
  puts "Error #{e.code}: #{e.message}"
end
```

## Configuration

```ruby
# Custom base URL (for self-hosted instances)
client = Unosend::Client.new('un_your_api_key',
  base_url: 'https://your-instance.com/api/v1'
)
```

## License

MIT
