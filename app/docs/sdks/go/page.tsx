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
            <span className="text-[14px] text-muted-foreground">Go 1.18 or higher</span>
          </li>
        </ul>
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
    "os"
    
    "github.com/unosend/unosend-go"
)

func main() {
    // Initialize client
    client := unosend.NewClient(os.Getenv("UNOSEND_API_KEY"))
    
    // Send an email
    email, err := client.Emails.Send(&unosend.SendEmailParams{
        From:    "hello@yourdomain.com",
        To:      []string{"user@example.com"},
        Subject: "Welcome!",
        HTML:    "<h1>Hello World</h1><p>Welcome to Unosend!</p>",
    })
    
    if err != nil {
        fmt.Printf("Error: %v\\n", err)
        return
    }
    
    fmt.Printf("Email sent! ID: %s\\n", email.ID)
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
    "time"
    
    "github.com/unosend/unosend-go"
)

func main() {
    client := unosend.NewClient("un_your_api_key",
        unosend.WithTimeout(30 * time.Second),
        unosend.WithRetries(3),
        unosend.WithBaseURL("https://api.unosend.com"),
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
    "github.com/unosend/unosend-go"
)

var client *unosend.Client

func init() {
    client = unosend.NewClient(os.Getenv("UNOSEND_API_KEY"))
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
        
        email, err := client.Emails.Send(&unosend.SendEmailParams{
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
    
    "github.com/unosend/unosend-go"
)

var client *unosend.Client

func init() {
    client = unosend.NewClient(os.Getenv("UNOSEND_API_KEY"))
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
    
    email, err := client.Emails.Send(&unosend.SendEmailParams{
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
}`}
        />
      </section>

      {/* Error Handling */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Handling</h2>
        <CodeBlock 
          filename="errors.go"
          showLineNumbers
          code={`package main

import (
    "errors"
    "fmt"
    
    "github.com/unosend/unosend-go"
)

func main() {
    client := unosend.NewClient("un_your_api_key")
    
    email, err := client.Emails.Send(&unosend.SendEmailParams{
        From:    "hello@yourdomain.com",
        To:      []string{"user@example.com"},
        Subject: "Hello",
        HTML:    "<p>Hello</p>",
    })
    
    if err != nil {
        var rateLimitErr *unosend.RateLimitError
        var authErr *unosend.AuthenticationError
        var validationErr *unosend.ValidationError
        
        switch {
        case errors.As(err, &rateLimitErr):
            fmt.Printf("Rate limited. Retry after: %v\\n", rateLimitErr.RetryAfter)
        case errors.As(err, &authErr):
            fmt.Println("Invalid API key")
        case errors.As(err, &validationErr):
            fmt.Printf("Validation error: %s\\n", validationErr.Message)
        default:
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
                <td className="px-4 py-3"><InlineCode>Emails.Send()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Send an email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Emails.Get()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Get email details</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Domains.Create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a domain</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Domains.Verify()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Verify domain DNS</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Audiences.Create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create an audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>Contacts.Create()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a contact</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
