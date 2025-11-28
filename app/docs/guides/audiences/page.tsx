import { CodeBlock, InlineCode } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Users, Tag, Mail } from 'lucide-react'

export default function AudiencesGuidePage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-emerald-50 text-emerald-700 border-0">
          Guide
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Audiences & Contacts</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Learn how to manage your subscribers, organize contacts into audiences, 
          and send targeted emails to specific segments.
        </p>
      </div>

      {/* Concepts */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Key Concepts</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <Users className="w-5 h-5 text-blue-600 mb-3" />
            <h3 className="text-[14px] font-semibold text-stone-900 mb-1">Audiences</h3>
            <p className="text-[13px] text-muted-foreground">
              Lists of contacts grouped by purpose. E.g., Newsletter subscribers, Product updates, etc.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <Mail className="w-5 h-5 text-green-600 mb-3" />
            <h3 className="text-[14px] font-semibold text-stone-900 mb-1">Contacts</h3>
            <p className="text-[13px] text-muted-foreground">
              Individual subscribers with email addresses and custom properties.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <Tag className="w-5 h-5 text-purple-600 mb-3" />
            <h3 className="text-[14px] font-semibold text-stone-900 mb-1">Properties</h3>
            <p className="text-[13px] text-muted-foreground">
              Custom fields on contacts for personalization and segmentation.
            </p>
          </div>
        </div>
      </section>

      {/* Creating Audiences */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Creating an Audience</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Create an audience to group your contacts:
        </p>
        
        <CodeBlock 
          filename="create-audience.ts"
          showLineNumbers
          code={`const { data, error } = await unosend.audiences.create({
  name: 'Newsletter Subscribers',
  description: 'Users who signed up for our weekly newsletter'
});

console.log('Audience ID:', data.id);
// aud_xxxxxxxxxxxxxxxx`}
        />
      </section>

      {/* Adding Contacts */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Adding Contacts</h2>
        
        <h3 className="text-[16px] font-semibold text-stone-900 mb-3">Single Contact</h3>
        <CodeBlock 
          filename="add-contact.ts"
          showLineNumbers
          code={`const { data, error } = await unosend.contacts.create({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  properties: {
    company: 'Acme Inc',
    role: 'Developer',
    signup_date: '2024-01-15',
    plan: 'pro'
  }
});

console.log('Contact ID:', data.id);`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Bulk Import</h3>
        <CodeBlock 
          filename="bulk-import.ts"
          showLineNumbers
          code={`const contacts = [
  { email: 'user1@example.com', first_name: 'Alice', properties: { plan: 'free' } },
  { email: 'user2@example.com', first_name: 'Bob', properties: { plan: 'pro' } },
  { email: 'user3@example.com', first_name: 'Carol', properties: { plan: 'enterprise' } },
];

const { data, error } = await unosend.contacts.bulkCreate({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  contacts: contacts,
  skip_duplicates: true  // Don't error on existing contacts
});

console.log(\`Imported \${data.created} contacts\`);
console.log(\`Skipped \${data.skipped} duplicates\`);`}
        />
      </section>

      {/* Contact Properties */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Contact Properties</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Store custom data on contacts for personalization:
        </p>
        
        <CodeBlock 
          filename="contact-properties.ts"
          showLineNumbers
          code={`// Create contact with properties
const { data, error } = await unosend.contacts.create({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  email: 'user@example.com',
  first_name: 'Jane',
  last_name: 'Smith',
  properties: {
    // Standard fields
    company: 'Tech Corp',
    job_title: 'Product Manager',
    
    // Dates (ISO format)
    signup_date: '2024-01-15',
    last_purchase: '2024-03-20',
    
    // Numbers
    lifetime_value: 1500,
    order_count: 12,
    
    // Booleans
    is_premium: true,
    newsletter_opted_in: true,
    
    // Arrays (for tags/categories)
    interests: ['technology', 'design', 'marketing']
  }
});`}
        />

        <h3 className="text-[16px] font-semibold text-stone-900 mt-6 mb-3">Update Properties</h3>
        <CodeBlock 
          filename="update-properties.ts"
          showLineNumbers
          code={`// Update specific properties
const { data, error } = await unosend.contacts.update('ctc_xxxxxxxx', {
  properties: {
    plan: 'enterprise',
    lifetime_value: 5000,
    last_purchase: '2024-03-25'
  }
});

// Properties are merged, not replaced
// Existing properties not included are preserved`}
        />
      </section>

      {/* Listing Contacts */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Listing & Searching Contacts</h2>
        
        <CodeBlock 
          filename="list-contacts.ts"
          showLineNumbers
          code={`// List all contacts in an audience
const { data, error } = await unosend.contacts.list({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  limit: 100,
  offset: 0
});

console.log('Contacts:', data.contacts);
console.log('Total:', data.total);

// Search by email
const { data: searchResult } = await unosend.contacts.list({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  email: 'john@example.com'
});

// Get a specific contact
const { data: contact } = await unosend.contacts.get('ctc_xxxxxxxx');`}
        />
      </section>

      {/* Sending to Audiences */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sending to an Audience</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Send a broadcast email to all contacts in an audience:
        </p>
        
        <CodeBlock 
          filename="send-to-audience.ts"
          showLineNumbers
          code={`// Create a broadcast
const { data, error } = await unosend.broadcasts.create({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  from: 'hello@yourdomain.com',
  subject: 'Weekly Newsletter - March Edition',
  template_id: 'tpl_xxxxxxxxxxxxxxxx',
  // Optional: filter to subset of audience
  filters: {
    properties: {
      is_premium: true
    }
  },
  // Schedule for later (optional)
  scheduled_at: '2024-03-25T09:00:00Z'
});

console.log('Broadcast ID:', data.id);
console.log('Recipients:', data.recipient_count);

// Send immediately
await unosend.broadcasts.send(data.id);`}
        />
      </section>

      {/* Unsubscribes */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Managing Unsubscribes</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Contacts can unsubscribe from audiences. We automatically handle unsubscribe 
          links in your emails:
        </p>
        
        <CodeBlock 
          filename="unsubscribe-handling.ts"
          showLineNumbers
          code={`// Check if contact is unsubscribed
const { data: contact } = await unosend.contacts.get('ctc_xxxxxxxx');
console.log('Unsubscribed:', contact.unsubscribed);
console.log('Unsubscribed at:', contact.unsubscribed_at);

// Manually unsubscribe a contact
await unosend.contacts.update('ctc_xxxxxxxx', {
  unsubscribed: true
});

// Re-subscribe (only if they've opted in again)
await unosend.contacts.update('ctc_xxxxxxxx', {
  unsubscribed: false
});`}
        />

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
          <p className="text-[13px] text-blue-800">
            <strong>Automatic Unsubscribe Links:</strong> We automatically add unsubscribe 
            links to your emails if you use the <InlineCode>{"{{unsubscribe_url}}"}</InlineCode> variable 
            in your templates.
          </p>
        </div>
      </section>

      {/* Segmentation */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Segmentation</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          Target specific contacts based on their properties:
        </p>
        
        <CodeBlock 
          filename="segmentation.ts"
          showLineNumbers
          code={`// Send to premium users only
const { data } = await unosend.broadcasts.create({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  from: 'hello@yourdomain.com',
  subject: 'Exclusive Premium Feature Update',
  template_id: 'tpl_xxxxxxxxxxxxxxxx',
  filters: {
    properties: {
      is_premium: true
    }
  }
});

// Send to users who signed up recently
const { data: recentSignups } = await unosend.broadcasts.create({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  from: 'hello@yourdomain.com',
  subject: 'Getting Started Guide',
  template_id: 'tpl_onboarding',
  filters: {
    signup_date: {
      after: '2024-03-01'
    }
  }
});

// Complex filters
const { data: targeted } = await unosend.broadcasts.create({
  audience_id: 'aud_xxxxxxxxxxxxxxxx',
  from: 'hello@yourdomain.com',
  subject: 'Special Offer',
  template_id: 'tpl_xxxxxxxxxxxxxxxx',
  filters: {
    properties: {
      plan: ['pro', 'enterprise'],
      order_count: { gte: 5 },
      is_premium: true
    }
  }
});`}
        />
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Organize with audiences</strong> - Create separate 
              audiences for different purposes (newsletter, product updates, etc.)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Use properties</strong> - Store relevant data 
              for personalization and segmentation
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Handle unsubscribes</strong> - Never re-add 
              unsubscribed contacts without explicit consent
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Clean your lists</strong> - Remove bounced 
              emails and inactive contacts regularly
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted-foreground">
              <strong className="text-stone-900">Double opt-in</strong> - Confirm subscriptions 
              to maintain a quality list
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
