# unosend

Official Python SDK for [Unosend](https://unosend.com) - Email API Service.

## Installation

```bash
pip install unosend
```

## Quick Start

```python
from unosend import Unosend

unosend = Unosend("un_your_api_key")

# Send an email
response = unosend.emails.send(
    from_address="hello@yourdomain.com",
    to="user@example.com",
    subject="Hello from Unosend!",
    html="<h1>Welcome!</h1><p>Thanks for signing up.</p>"
)

if response.error:
    print(f"Failed to send: {response.error.message}")
else:
    print(f"Email sent: {response.data.id}")
```

## Features

- 📧 **Emails** - Send transactional emails with HTML/text content
- 🌐 **Domains** - Manage and verify sending domains
- 👥 **Audiences** - Create and manage contact lists
- 📇 **Contacts** - Add, update, and remove contacts

## API Reference

### Emails

```python
# Send an email
response = unosend.emails.send(
    from_address="you@yourdomain.com",
    to=["user1@example.com", "user2@example.com"],
    subject="Hello!",
    html="<h1>Hello World</h1>",
    text="Hello World",  # Optional plain text version
    reply_to="support@yourdomain.com",
    cc=["cc@example.com"],
    bcc=["bcc@example.com"],
    headers={"X-Custom-Header": "value"},
    tags=[{"name": "campaign", "value": "welcome"}]
)

# Get email by ID
response = unosend.emails.get("email_id")

# List emails
response = unosend.emails.list(limit=10, offset=0)
```

### Domains

```python
# Add a domain
response = unosend.domains.create("yourdomain.com")

# Verify domain DNS records
response = unosend.domains.verify("domain_id")

# List domains
response = unosend.domains.list()

# Delete domain
response = unosend.domains.delete("domain_id")
```

### Audiences

```python
# Create an audience
response = unosend.audiences.create("Newsletter Subscribers")

# List audiences
response = unosend.audiences.list()

# Get audience
response = unosend.audiences.get("audience_id")

# Delete audience
response = unosend.audiences.delete("audience_id")
```

### Contacts

```python
# Add a contact
response = unosend.contacts.create(
    "audience_id",
    email="user@example.com",
    first_name="John",
    last_name="Doe"
)

# List contacts in an audience
response = unosend.contacts.list("audience_id")

# Update a contact
response = unosend.contacts.update(
    "contact_id",
    first_name="Jane",
    unsubscribed=False
)

# Delete a contact
response = unosend.contacts.delete("contact_id")
```

## Error Handling

All methods return an `ApiResponse` with `data` and `error` attributes:

```python
response = unosend.emails.send(...)

if response.error:
    print(f"Error {response.error.code}: {response.error.message}")
else:
    print(f"Success: {response.data}")

# Or use tuple unpacking
data, error = unosend.emails.send(...)
if error:
    print(f"Failed: {error.message}")
```

## Configuration

```python
# Custom base URL (for self-hosted instances)
unosend = Unosend(
    "un_your_api_key",
    base_url="https://your-instance.com/api/v1"
)
```

## Context Manager

```python
with Unosend("un_your_api_key") as unosend:
    response = unosend.emails.send(...)
# Client is automatically closed
```

## License

MIT
