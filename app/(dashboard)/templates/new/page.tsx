'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft,
  FileText,
  Save,
  Loader2,
  Eye,
  Code,
  Check,
  Cloud
} from 'lucide-react'
import { toast } from 'sonner'

export default function NewTemplatePage() {
  const router = useRouter()
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('unsaved')
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('edit')
  
  // Form fields
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [textContent, setTextContent] = useState('')
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitialContent = useRef(false)

  // Load organization
  useEffect(() => {
    async function loadOrg() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (membership) {
        setOrganizationId(membership.organization_id)
      } else {
        toast.error('No organization found')
      }
      setLoading(false)
    }
    loadOrg()
  }, [router])

  // Save template
  const saveTemplate = useCallback(async (redirect = false) => {
    // Only skip if auto-saving and no content yet
    if (!redirect && !hasInitialContent.current && !name && !subject && !htmlContent) {
      return
    }
    
    setSaveStatus('saving')
    setSaving(true)
    
    try {
      if (templateId) {
        // Update existing template
        const response = await fetch('/api/dashboard/templates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: templateId,
            name: name || 'Untitled Template',
            subject: subject || '(No subject)',
            html_content: htmlContent || null,
            text_content: textContent || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update')
        }
      } else {
        // Create new template
        const response = await fetch('/api/dashboard/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || 'Untitled Template',
            subject: subject || '(No subject)',
            html_content: htmlContent || null,
            text_content: textContent || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create')
        }

        const { data } = await response.json()
        if (data?.id) {
          setTemplateId(data.id)
          hasInitialContent.current = true
        }
      }

      setSaveStatus('saved')
      
      if (redirect) {
        toast.success('Template saved')
        router.push('/templates')
      }
    } catch (err) {
      console.error('Failed to save:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save template')
      setSaveStatus('unsaved')
    } finally {
      setSaving(false)
    }
  }, [templateId, name, subject, htmlContent, textContent, router])

  // Track content changes
  useEffect(() => {
    if (name || subject || htmlContent) {
      hasInitialContent.current = true
    }
  }, [name, subject, htmlContent])

  // Auto-save
  useEffect(() => {
    if (!organizationId || !hasInitialContent.current) return
    
    setSaveStatus('unsaved')
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveTemplate()
    }, 2000)
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [name, subject, htmlContent, textContent, organizationId, saveTemplate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/templates">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">New Template</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Create a reusable email template
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mr-2">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3 h-3 text-green-600" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <Cloud className="w-3 h-3" />
                <span>Unsaved</span>
              </>
            )}
          </div>
          <Button 
            size="sm" 
            className="h-8 text-[13px]"
            onClick={() => saveTemplate(true)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            Save Template
          </Button>
        </div>
      </div>

      {/* Template Details */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <FileText className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Template Details</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Basic information about your template
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[13px]">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome Email"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-[13px]">Email Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Welcome to {{company_name}}"
                className="h-9 text-[13px]"
              />
              <p className="text-[11px] text-muted-foreground">
                Use {"{{variable}}"} for dynamic content
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Code className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Email Content</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Write your email content in HTML or plain text
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit" className="text-[13px]">
                <Code className="w-3.5 h-3.5 mr-1.5" />
                HTML Editor
              </TabsTrigger>
              <TabsTrigger value="text" className="text-[13px]">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Plain Text
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-[13px]">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="mt-0">
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Template</title>
</head>
<body>
  <h1>Hello {{name}}!</h1>
  <p>Your email content here...</p>
</body>
</html>`}
                className="w-full h-[400px] p-4 font-mono text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
              />
            </TabsContent>
            
            <TabsContent value="text" className="mt-0">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Plain text version of your email (for email clients that don't support HTML)..."
                className="w-full h-[400px] p-4 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <div className="bg-stone-50 px-4 py-2 border-b border-stone-200">
                  <p className="text-[12px] text-muted-foreground">Email Preview</p>
                </div>
                {htmlContent ? (
                  <iframe
                    srcDoc={htmlContent}
                    className="w-full h-[400px] bg-white"
                    title="Email Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground text-[13px]">
                    No content to preview
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Variable Reference */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="p-4 sm:p-5 border-b border-stone-100">
          <h2 className="font-semibold text-[15px]">Template Variables</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Use these variables in your template</p>
        </div>
        
        <div className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { var: '{{email}}', desc: 'Recipient email address' },
              { var: '{{first_name}}', desc: 'First name' },
              { var: '{{last_name}}', desc: 'Last name' },
              { var: '{{company_name}}', desc: 'Your company name' },
              { var: '{{unsubscribe_url}}', desc: 'Unsubscribe link' },
              { var: '{{current_year}}', desc: 'Current year' },
            ].map((item) => (
              <div key={item.var} className="flex items-start gap-2 p-3 bg-stone-50 rounded-lg">
                <code className="text-[12px] bg-stone-200 px-1.5 py-0.5 rounded font-mono">
                  {item.var}
                </code>
                <span className="text-[12px] text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
