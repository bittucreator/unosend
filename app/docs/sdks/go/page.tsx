import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export default function GoSDKPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-cyan-50 text-cyan-700 border-0">
          SDK
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Go SDK</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          The official Go SDK for Unosend. Supports Go 1.18+ with full type safety.
        </p>
      </div>

      {/* Installation */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Installation</h2>
        <CodeBlock code="go get github.com/unosend/unosend-go" filename="go" />
      </section>

      {/* Requirements */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Requirements</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[14px] text-muted-foreground">Go 1.21 or higher</span>
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
          filename="main.go"
          showLineNumbers
          code={`package main

import (
    "os"
    unosend "github.com/unosend/unosend-go"
)

func main() {
    client := unosend.New(os.Getenv("UNOSEND_API_KEY"))
    // ...
}`}
        />
      </section>

      {/* Basic Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Basic Usage</h2>
        <CodeBlock 
          filename="main.go"
          showLineNumbers
          code={`package main

import (
    "fmt"
    "log"
    
    unosend "github.com/unosend/unosend-go"
)

func main() {
    // Initialize client
    client := unosend.New("un_your_api_key")
    
    // Send an email
    email, err := client.Emails.Send(&unosend.SendEmailRequest{
        From:    "hello@yourdomain.com",
        To:      []string{"user@example.com"},
        Subject: "Welcome!",
        HTML:    "<h1>Hello World</h1><p>Welcome to Unosend!</p>",
    })
    
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Email sent! ID: %s\\n", email.ID)
}`}
        />
      </section>

      {/* Response Format */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Response Format</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          SDK methods return typed structs and errors:
        </p>
        <CodeBlock 
          filename="response.go"
          showLineNumbers
          code={`// Email struct returned from Send/Get
type Email struct {
    ID        string   // "em_xxxxxxxxxxxxxxxxxxxxxxxx"
    From      string   // "hello@yourdomain.com"
    To        []string // ["user@example.com"]
    Subject   string   // "Welcome!"
    Status    string   // "queued", "sent", "delivered", etc.
    CreatedAt string   // "2024-01-15T10:30:00Z"
}

// Error struct for API errors
type Error struct {
    Message    string // "Invalid API key"
    Code       int    // 401
    StatusCode int    // 401
}`}
        />
      </section>

      {/* Sending with Attachments */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending with Attachments</h2>
        <CodeBlock 
          filename="attachments.go"
          showLineNumbers
          code={`package main

import (
    "encoding/base64"
    "os"
    
    unosend "github.com/unosend/unosend-go"
)

func main() {
    client := unosend.New(os.Getenv("UNOSEND_API_KEY"))
    
    // Read file and encode as base64
    fileContent, _ := os.ReadFile("invoice.pdf")
    encoded := base64.StdEncoding.EncodeToString(fileContent)
    
    // Send email with attachment
    email, err := client.Emails.Send(&unosend.SendEmailRequest{
        From:    "hello@yourdomain.com",
        To:      []string{"user@example.com"},
        Subject: "Your Invoice",
        HTML:    "<p>Please find your invoice attached.</p>",
        Attachments: []unosend.Attachment{
            {
                Filename:    "invoice.pdf",
                Content:     encoded,
                ContentType: "application/pdf",
            },
        },
    })
}`}
        />
      </section>

      {/* Working with Domains */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Working with Domains</h2>
        <CodeBlock 
          filename="domains.go"
          showLineNumbers
          code={`package main

import (
    "fmt"
    "os"
    
    unosend "github.com/unosend/unosend-go"
)

func main() {
    client := unosend.New(os.Getenv("UNOSEND_API_KEY"))
    
    // Add a domain
    domain, _ := client.Domains.Create("yourdomain.com")
    fmt.Printf("Domain added: %s\\n", domain.ID)
    fmt.Printf("DNS Records: %+v\\n", domain.Records)
    
    // List all domains
    domains, _ := client.Domains.List()
    for _, d := range domains {
        fmt.Printf("%s - %s\\n", d.Name, d.Status)
    }
    
    // Verify domain DNS
    verified, _ := client.Domains.Verify(domain.ID)
    fmt.Printf("Status: %s\\n", verified.Status)
    
    // Delete a domain
    client.Domains.Delete(domain.ID)
}`}
        />
      </section>

      {/* Working with Audiences & Contacts */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Working with Audiences & Contacts</h2>
        <CodeBlock 
          filename="audiences.go"
          showLineNumbers
          code={`package main

import (
    "fmt"
    "os"
    
    unosend "github.com/unosend/unosend-go"
)

func main() {
    client := unosend.New(os.Getenv("UNOSEND_API_KEY"))
    
    // Create an audience
    audience, _ := client.Audiences.Create("Newsletter Subscribers")
    fmt.Printf("Audience created: %s\\n", audience.ID)
    
    // Add a contact
    contact, _ := client.Contacts.Create(audience.ID, &unosend.CreateContactRequest{
        Email:     "subscriber@example.com",
        FirstName: "John",
        LastName:  "Doe",
    })
    fmt.Printf("Contact added: %s\\n", contact.ID)
    
    // List all contacts
    contacts, _ := client.Contacts.List(audience.ID)
    fmt.Printf("Total subscribers: %d\\n", len(contacts))
    
    // List all audiences
    audiences, _ := client.Audiences.List()
    for _, a := range audiences {
        fmt.Printf("%s: %d contacts\\n", a.Name, a.ContactCount)
    }
}`}
        />
      </section>

      {/* Configuration */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Configuration</h2>
        <CodeBlock 
          filename="config.go"
          showLineNumbers
          code={`package main

import (
    "net/http"
    "time"
    
    unosend "github.com/unosend/unosend-go"
)

func main() {
    // Custom configuration
    client := unosend.New("un_your_api_key",
        unosend.WithBaseURL("https://your-instance.com/api/v1"),
        unosend.WithHTTPClient(&http.Client{
            Timeout: 60 * time.Second,
        }),
    )
    
    // Use client...
}`}
        />
      </section>

      {/* Framework Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Framework Examples</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Gin</h3>
        <CodeBlock 
          filename="main.go"
          showLineNumbers
          code={`package main

import (
    "net/http"
    "os"
    
    "github.com/gin-gonic/gin"
    unosend "github.com/unosend/unosend-go"
)

var client *unosend.Client

func init() {
    client = unosend.New(os.Getenv("UNOSEND_API_KEY"))
}

type EmailRequest struct {
    To      string \`json:"to" binding:"required"\`
    Subject string \`json:"subject" binding:"required"\`
    HTML    string \`json:"html" binding:"required"\`
}

func main() {
    r := gin.Default()
    
    r.POST("/send-email", func(c *gin.Context) {
        var req EmailRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        
        email, err := client.Emails.Send(&unosend.SendEmailRequest{
            From:    "hello@yourdomain.com",
            To:      []string{req.To},
            Subject: req.Subject,
            HTML:    req.HTML,
        })
        
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        
        c.JSON(http.StatusOK, gin.H{"id": email.ID})
    })
    
    r.Run(":8080")
}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Standard HTTP</h3>
        <CodeBlock 
          filename="main.go"
          showLineNumbers
          code={`package main

import (
    "encoding/json"
    "net/http"
    "os"
    
    unosend "github.com/unosend/unosend-go"
)

var client *unosend.Client

func init() {
    client = unosend.New(os.Getenv("UNOSEND_API_KEY"))
}

func sendEmailHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    
    var req struct {
        To      string \`json:"to"\`
        Subject string \`json:"subject"\`
        HTML    string \`json:"html"\`
    }
    
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    email, err := client.Emails.Send(&unosend.SendEmailRequest{
        From:    "hello@yourdomain.com",
        To:      []string{req.To},
        Subject: req.Subject,
        HTML:    req.HTML,
    })
    
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"id": email.ID})
}

func main() {
    http.HandleFunc("/send-email", sendEmailHandler)
    http.ListenAndServe(":8080", nil)
}\`}
        />
      </section>

      {/* Error Handling */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Handling</h2>
        <CodeBlock 
          filename="errors.go"
          showLineNumbers
          code={\`package main

import (
    "fmt"
    
    unosend "github.com/unosend/unosend-go"
)

func main() {
    client := unosend.New("un_your_api_key")
    
    email, err := client.Emails.Send(&unosend.SendEmailRequest{
        From:    "hello@yourdomain.com",
        To:      []string{"user@example.com"},
        Subject: "Hello",
        HTML:    "<p>Hello</p>",
    })
    
    if err != nil {
        // Check if it's a Unosend API error
        if apiErr, ok := err.(*unosend.Error); ok {
            fmt.Printf("API error: %s (code: %d)\\n", apiErr.Message, apiErr.StatusCode)
        } else {
            fmt.Printf("Error: %v\\n", err)
        }
        return
    }
    
    fmt.Printf("Email sent: %s\\n", email.ID)
}`}
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
                <td className="px-4 py-3"><InlineCode>Emails.Send(req)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Send an email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Emails.Get(id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Get email by ID</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Emails.List(limit, offset)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all emails</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Domains.Create(name)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a domain</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Domains.Verify(id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Verify domain DNS</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Domains.List()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all domains</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Audiences.Create(name)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create an audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Audiences.List()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all audiences</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Contacts.Create(audienceId, req)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a contact</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Contacts.List(audienceId)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List contacts in audience</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
