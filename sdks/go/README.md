# unosend-go

Official Go SDK for [Unosend](https://unosend.com) - Email API Service.

## Installation

```bash
go get github.com/unosend/unosend-go
```

## Quick Start

```go
package main

import (
    "fmt"
    "log"

    "github.com/unosend/unosend-go"
)

func main() {
    client := unosend.New("un_your_api_key")

    // Send an email
    email, err := client.Emails.Send(&unosend.SendEmailRequest{
        From:    "hello@yourdomain.com",
        To:      []string{"user@example.com"},
        Subject: "Hello from Unosend!",
        HTML:    "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
    })
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Email sent: %s\n", email.ID)
}
```

## Features

- 📧 **Emails** - Send transactional emails with HTML/text content
- 🌐 **Domains** - Manage and verify sending domains
- 👥 **Audiences** - Create and manage contact lists
- 📇 **Contacts** - Add, update, and remove contacts

## API Reference

### Emails

```go
// Send an email
email, err := client.Emails.Send(&unosend.SendEmailRequest{
    From:    "you@yourdomain.com",
    To:      []string{"user1@example.com", "user2@example.com"},
    Subject: "Hello!",
    HTML:    "<h1>Hello World</h1>",
    Text:    "Hello World", // Optional
    ReplyTo: "support@yourdomain.com",
    CC:      []string{"cc@example.com"},
    BCC:     []string{"bcc@example.com"},
    Headers: map[string]string{"X-Custom-Header": "value"},
    Tags:    []unosend.Tag{{Name: "campaign", Value: "welcome"}},
})

// Get email by ID
email, err := client.Emails.Get("email_id")

// List emails
emails, err := client.Emails.List(&unosend.ListOptions{Limit: 10, Offset: 0})
```

### Domains

```go
// Add a domain
domain, err := client.Domains.Create("yourdomain.com")

// Verify domain DNS records
domain, err := client.Domains.Verify("domain_id")

// List domains
domains, err := client.Domains.List()

// Delete domain
err := client.Domains.Delete("domain_id")
```

### Audiences

```go
// Create an audience
audience, err := client.Audiences.Create("Newsletter Subscribers")

// List audiences
audiences, err := client.Audiences.List()

// Get audience
audience, err := client.Audiences.Get("audience_id")

// Delete audience
err := client.Audiences.Delete("audience_id")
```

### Contacts

```go
// Add a contact
contact, err := client.Contacts.Create(&unosend.CreateContactRequest{
    AudienceID: "audience_id",
    Email:      "user@example.com",
    FirstName:  "John",
    LastName:   "Doe",
})

// List contacts in an audience
contacts, err := client.Contacts.List("audience_id")

// Update a contact
firstName := "Jane"
contact, err := client.Contacts.Update("contact_id", &unosend.UpdateContactRequest{
    FirstName: &firstName,
})

// Delete a contact
err := client.Contacts.Delete("contact_id")
```

## Error Handling

```go
email, err := client.Emails.Send(&unosend.SendEmailRequest{...})
if err != nil {
    if apiErr, ok := err.(*unosend.Error); ok {
        fmt.Printf("API Error %d: %s\n", apiErr.Code, apiErr.Message)
    } else {
        fmt.Printf("Error: %v\n", err)
    }
    return
}
```

## Configuration

```go
// Custom base URL (for self-hosted instances)
client := unosend.New("un_your_api_key",
    unosend.WithBaseURL("https://your-instance.com/api/v1"),
)

// Custom HTTP client
client := unosend.New("un_your_api_key",
    unosend.WithHTTPClient(&http.Client{Timeout: 60 * time.Second}),
)
```

## License

MIT
