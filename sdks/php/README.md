# unosend-php

Official PHP SDK for [Unosend](https://unosend.com) - Email API Service.

## Installation

```bash
composer require unosend/unosend-php
```

## Quick Start

```php
<?php

require_once 'vendor/autoload.php';

use Unosend\Unosend;

$unosend = new Unosend('un_your_api_key');

// Send an email
$email = $unosend->emails->send([
    'from' => 'hello@yourdomain.com',
    'to' => 'user@example.com',
    'subject' => 'Hello from Unosend!',
    'html' => '<h1>Welcome!</h1><p>Thanks for signing up.</p>'
]);

echo "Email sent: " . $email['id'];
```

## Features

- 📧 **Emails** - Send transactional emails with HTML/text content
- 🌐 **Domains** - Manage and verify sending domains
- 👥 **Audiences** - Create and manage contact lists
- 📇 **Contacts** - Add, update, and remove contacts

## API Reference

### Emails

```php
// Send an email
$email = $unosend->emails->send([
    'from' => 'you@yourdomain.com',
    'to' => ['user1@example.com', 'user2@example.com'],
    'subject' => 'Hello!',
    'html' => '<h1>Hello World</h1>',
    'text' => 'Hello World',  // Optional
    'replyTo' => 'support@yourdomain.com',
    'cc' => ['cc@example.com'],
    'bcc' => ['bcc@example.com'],
    'headers' => ['X-Custom-Header' => 'value'],
    'tags' => [['name' => 'campaign', 'value' => 'welcome']]
]);

// Get email by ID
$email = $unosend->emails->get('email_id');

// List emails
$emails = $unosend->emails->list(limit: 10, offset: 0);
```

### Domains

```php
// Add a domain
$domain = $unosend->domains->create('yourdomain.com');

// Verify domain DNS records
$domain = $unosend->domains->verify('domain_id');

// List domains
$domains = $unosend->domains->list();

// Delete domain
$unosend->domains->delete('domain_id');
```

### Audiences

```php
// Create an audience
$audience = $unosend->audiences->create('Newsletter Subscribers');

// List audiences
$audiences = $unosend->audiences->list();

// Get audience
$audience = $unosend->audiences->get('audience_id');

// Delete audience
$unosend->audiences->delete('audience_id');
```

### Contacts

```php
// Add a contact
$contact = $unosend->contacts->create([
    'audienceId' => 'audience_id',
    'email' => 'user@example.com',
    'firstName' => 'John',
    'lastName' => 'Doe'
]);

// List contacts in an audience
$contacts = $unosend->contacts->list('audience_id');

// Update a contact
$contact = $unosend->contacts->update('contact_id', [
    'firstName' => 'Jane',
    'unsubscribed' => false
]);

// Delete a contact
$unosend->contacts->delete('contact_id');
```

## Error Handling

```php
use Unosend\UnosendException;

try {
    $email = $unosend->emails->send([...]);
} catch (UnosendException $e) {
    echo "Error {$e->getCode()}: {$e->getMessage()}";
    echo "HTTP Status: {$e->getStatusCode()}";
}
```

## Configuration

```php
// Custom base URL (for self-hosted instances)
$unosend = new Unosend(
    'un_your_api_key',
    'https://your-instance.com/api/v1'
);
```

## Requirements

- PHP 8.0 or higher
- Guzzle HTTP client

## License

MIT
