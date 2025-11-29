import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export default function PHPSDKPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-indigo-50 text-indigo-700 border-0">
          SDK
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">PHP SDK</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          The official PHP SDK for Unosend. Supports PHP 8.0+ with full PSR compatibility.
        </p>
      </div>

      {/* Installation */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Installation</h2>
        <CodeBlock code="composer require unosend/unosend-php" filename="composer" />
      </section>

      {/* Requirements */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Requirements</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[14px] text-muted-foreground">PHP 8.0 or higher</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[14px] text-muted-foreground">Guzzle HTTP client</span>
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
          filename="config.php"
          showLineNumbers
          code={`<?php

require 'vendor/autoload.php';

use Unosend\\Unosend;

$unosend = new Unosend($_ENV['UNOSEND_API_KEY']);
// Or with dotenv
$unosend = new Unosend(getenv('UNOSEND_API_KEY'));`}
        />
      </section>

      {/* Basic Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Basic Usage</h2>
        <CodeBlock 
          filename="send-email.php"
          showLineNumbers
          code={`<?php

require 'vendor/autoload.php';

use Unosend\\Unosend;
use Unosend\\UnosendException;

// Initialize client
$unosend = new Unosend('un_your_api_key');

// Send an email
try {
    $email = $unosend->emails->send([
        'from' => 'hello@yourdomain.com',
        'to' => 'user@example.com',  // Can be string or array
        'subject' => 'Welcome!',
        'html' => '<h1>Hello World</h1><p>Welcome to Unosend!</p>'
    ]);
    
    echo "Email sent! ID: " . $email['id'];
} catch (UnosendException $e) {
    echo "Error: " . $e->getMessage();
}`}
        />
      </section>

      {/* Response Format */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Response Format</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          SDK methods return PHP arrays. Errors are thrown as exceptions:
        </p>
        <CodeBlock 
          filename="response.php"
          showLineNumbers
          code={`<?php

// Successful response (array)
$email = $unosend->emails->send([...]);
$email['id'];        // "em_xxxxxxxxxxxxxxxxxxxxxxxx"
$email['from'];      // "hello@yourdomain.com"
$email['to'];        // ["user@example.com"]
$email['subject'];   // "Welcome!"
$email['status'];    // "queued"
$email['createdAt']; // "2024-01-15T10:30:00Z"

// Errors are thrown as exceptions
try {
    $unosend->emails->send([...]);
} catch (UnosendException $e) {
    $e->getMessage();     // "Invalid API key"
    $e->getStatusCode();  // 401
}`}
        />
      </section>

      {/* Sending with Attachments */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending with Attachments</h2>
        <CodeBlock 
          filename="attachments.php"
          showLineNumbers
          code={`<?php

require 'vendor/autoload.php';

use Unosend\\Unosend;

$unosend = new Unosend($_ENV['UNOSEND_API_KEY']);

// Read file and encode as base64
$fileContent = base64_encode(file_get_contents('invoice.pdf'));

// Send email with attachment
$email = $unosend->emails->send([
    'from' => 'hello@yourdomain.com',
    'to' => ['user@example.com'],
    'subject' => 'Your Invoice',
    'html' => '<p>Please find your invoice attached.</p>',
    'attachments' => [
        [
            'filename' => 'invoice.pdf',
            'content' => $fileContent,
            'contentType' => 'application/pdf'
        ]
    ]
]);`}
        />
      </section>

      {/* Working with Domains */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Working with Domains</h2>
        <CodeBlock 
          filename="domains.php"
          showLineNumbers
          code={`<?php

use Unosend\\Unosend;

$unosend = new Unosend($_ENV['UNOSEND_API_KEY']);

// Add a domain
$domain = $unosend->domains->create('yourdomain.com');
echo "Domain added: " . $domain['id'] . "\\n";
echo "DNS Records: " . print_r($domain['records'], true);

// List all domains
$domains = $unosend->domains->list();
foreach ($domains as $d) {
    echo $d['name'] . " - " . $d['status'] . "\\n";
}

// Verify domain DNS
$verified = $unosend->domains->verify($domain['id']);
echo "Status: " . $verified['status'];

// Delete a domain
$unosend->domains->delete($domain['id']);`}
        />
      </section>

      {/* Working with Audiences & Contacts */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Working with Audiences & Contacts</h2>
        <CodeBlock 
          filename="audiences.php"
          showLineNumbers
          code={`<?php

use Unosend\\Unosend;

$unosend = new Unosend($_ENV['UNOSEND_API_KEY']);

// Create an audience
$audience = $unosend->audiences->create('Newsletter Subscribers');
echo "Audience created: " . $audience['id'] . "\\n";

// Add a contact
$contact = $unosend->contacts->create($audience['id'], [
    'email' => 'subscriber@example.com',
    'firstName' => 'John',
    'lastName' => 'Doe'
]);
echo "Contact added: " . $contact['id'] . "\\n";

// List all contacts
$contacts = $unosend->contacts->list($audience['id']);
echo "Total subscribers: " . count($contacts) . "\\n";

// List all audiences
$audiences = $unosend->audiences->list();
foreach ($audiences as $a) {
    echo $a['name'] . ": " . $a['contactCount'] . " contacts\\n";
}`}
        />
      </section>

      {/* Framework Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Framework Examples</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Laravel</h3>
        <CodeBlock 
          filename="app/Http/Controllers/EmailController.php"
          showLineNumbers
          code={`<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Unosend\\Unosend;
use Unosend\\UnosendException;

class EmailController extends Controller
{
    private Unosend $unosend;
    
    public function __construct()
    {
        $this->unosend = new Unosend(config('services.unosend.key'));
    }
    
    public function send(Request $request)
    {
        $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string',
            'html' => 'required|string',
        ]);
        
        try {
            $response = $this->unosend->emails->send([
                'from' => 'hello@yourdomain.com',
                'to' => [$request->to],
                'subject' => $request->subject,
                'html' => $request->html,
            ]);
            
            return response()->json(['id' => $response['id']]);
        } catch (UnosendException $e) {
            return response()->json(['error' => $e->getMessage()], $e->getStatusCode() ?? 400);
        }
    }
}`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Symfony</h3>
        <CodeBlock 
          filename="src/Controller/EmailController.php"
          showLineNumbers
          code={`<?php

namespace App\\Controller;

use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;
use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\Routing\\Annotation\\Route;
use Unosend\\Unosend;
use Unosend\\UnosendException;

class EmailController extends AbstractController
{
    private Unosend $unosend;
    
    public function __construct()
    {
        $this->unosend = new Unosend($_ENV['UNOSEND_API_KEY']);
    }
    
    #[Route('/send-email', methods: ['POST'])]
    public function send(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        try {
            $response = $this->unosend->emails->send([
                'from' => 'hello@yourdomain.com',
                'to' => [$data['to']],
                'subject' => $data['subject'],
                'html' => $data['html'],
            ]);
            
            return $this->json(['id' => $response['id']]);
        } catch (UnosendException $e) {
            return $this->json(['error' => $e->getMessage()], $e->getStatusCode() ?? 400);
        }
    }
}`}
        />
      </section>

      {/* Error Handling */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Error Handling</h2>
        <CodeBlock 
          filename="errors.php"
          showLineNumbers
          code={`<?php

use Unosend\\Unosend;
use Unosend\\UnosendException;

$unosend = new Unosend('un_your_api_key');

try {
    $response = $unosend->emails->send([
        'from' => 'hello@yourdomain.com',
        'to' => ['user@example.com'],
        'subject' => 'Hello',
        'html' => '<p>Hello</p>'
    ]);
    
    echo "Email sent: " . $response['id'];
} catch (UnosendException $e) {
    echo "Error: " . $e->getMessage();
    echo "Status code: " . $e->getStatusCode();
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
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;emails-&gt;send($params)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Send an email</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;emails-&gt;get($id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Get email by ID</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;emails-&gt;list($limit, $offset)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all emails</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;domains-&gt;create($name)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a domain</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;domains-&gt;verify($id)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Verify domain DNS</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;domains-&gt;list()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all domains</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;audiences-&gt;create($name)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Create an audience</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;audiences-&gt;list()</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List all audiences</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;contacts-&gt;create($audienceId, $params)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">Add a contact</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><InlineCode>$unosend-&gt;contacts-&gt;list($audienceId)</InlineCode></td>
                <td className="px-4 py-3 text-muted-foreground">List contacts in audience</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
