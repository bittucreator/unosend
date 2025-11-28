'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft,
  Radio,
  Save,
  Loader2,
  Eye,
  Code,
  Send,
  Check,
  Cloud,
  Users,
  Mail,
  CalendarIcon,
  FileText,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Audience {
  id: string
  name: string
  _count?: { contacts: number }
}

interface Template {
  id: string
  name: string
  subject: string
  html_content: string | null
}

interface Domain {
  domain: string
}

export default function NewBroadcastPage() {
  const router = useRouter()
  const [broadcastId, setBroadcastId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('unsaved')
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('edit')
  
  // Form fields
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [audienceId, setAudienceId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [textContent, setTextContent] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState('')
  
  // Data
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [contactCount, setContactCount] = useState(0)
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitialContent = useRef(false)

  // Load data
  useEffect(() => {
    async function loadData() {
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

      if (!membership) return
      setOrganizationId(membership.organization_id)

      const [audiencesRes, templatesRes, domainsRes] = await Promise.all([
        supabase.from('audiences').select('id, name').eq('organization_id', membership.organization_id),
        supabase.from('templates').select('id, name, subject, html_content').eq('organization_id', membership.organization_id),
        supabase.from('domains').select('domain').eq('organization_id', membership.organization_id).eq('status', 'verified')
      ])

      setAudiences(audiencesRes.data || [])
      setTemplates(templatesRes.data || [])
      setDomains(domainsRes.data || [])
    }
    loadData()
  }, [router])

  // Load contact count when audience changes
  useEffect(() => {
    async function loadContactCount() {
      if (!audienceId) {
        setContactCount(0)
        return
      }

      const supabase = createClient()
      const { count } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('audience_id', audienceId)
        .eq('subscribed', true)

      setContactCount(count || 0)
    }
    loadContactCount()
  }, [audienceId])

  // Load template content when template changes
  useEffect(() => {
    if (!templateId) return
    
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setHtmlContent(template.html_content || '')
    }
  }, [templateId, templates])

  // Save broadcast
  const saveBroadcast = useCallback(async (redirect = false) => {
    // Only skip if auto-saving and no content yet
    if (!redirect && !hasInitialContent.current && !name && !subject && !htmlContent) {
      return
    }
    
    setSaveStatus('saving')
    setSaving(true)
    
    try {
      // Calculate scheduled_at
      let scheduledAt = null
      if (scheduledDate) {
        const date = new Date(scheduledDate)
        if (scheduledTime) {
          const [hours, minutes] = scheduledTime.split(':')
          date.setHours(parseInt(hours), parseInt(minutes))
        }
        scheduledAt = date.toISOString()
      }
      
      const broadcastData = {
        name: name || 'Untitled Broadcast',
        subject: subject || '(No subject)',
        from_email: fromEmail || 'noreply@example.com',
        from_name: fromName || null,
        reply_to: replyTo || null,
        audience_id: audienceId || null,
        html_content: htmlContent || null,
        text_content: textContent || null,
        status: 'draft',
        scheduled_at: scheduledAt,
        total_recipients: contactCount,
      }

      if (broadcastId) {
        const response = await fetch('/api/dashboard/broadcasts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: broadcastId, ...broadcastData }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update')
        }
      } else {
        const response = await fetch('/api/dashboard/broadcasts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(broadcastData),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create')
        }

        const { data } = await response.json()
        if (data?.id) {
          setBroadcastId(data.id)
          hasInitialContent.current = true
        }
      }

      setSaveStatus('saved')
      
      if (redirect) {
        toast.success('Broadcast saved')
        router.push('/broadcasts')
      }
    } catch (err) {
      console.error('Failed to save:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save broadcast')
      setSaveStatus('unsaved')
    } finally {
      setSaving(false)
    }
  }, [broadcastId, name, subject, htmlContent, textContent, fromEmail, fromName, replyTo, audienceId, scheduledDate, scheduledTime, contactCount, router])

  // Send broadcast
  const sendBroadcast = async () => {
    if (!broadcastId) {
      // Save first
      await saveBroadcast()
    }
    
    if (!audienceId) {
      toast.error('Please select an audience')
      return
    }
    
    if (!fromEmail) {
      toast.error('Please enter a from email')
      return
    }
    
    if (!subject) {
      toast.error('Please enter a subject')
      return
    }
    
    if (!htmlContent && !textContent) {
      toast.error('Please add email content')
      return
    }
    
    setSending(true)
    
    try {
      // Save first to ensure we have latest data
      await saveBroadcast()
      
      // Call the send API
      const response = await fetch(`/api/v1/broadcasts/${broadcastId}/send`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send')
      }
      
      toast.success('Broadcast is being sent!')
      router.push('/broadcasts')
    } catch (err) {
      console.error('Failed to send:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to send broadcast')
    } finally {
      setSending(false)
    }
  }

  // Track content changes
  useEffect(() => {
    if (name || subject || htmlContent || audienceId) {
      hasInitialContent.current = true
    }
  }, [name, subject, htmlContent, audienceId])

  // Auto-save
  useEffect(() => {
    if (!organizationId || !hasInitialContent.current) return
    
    setSaveStatus('unsaved')
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveBroadcast()
    }, 2000)
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [name, subject, htmlContent, textContent, fromEmail, fromName, audienceId, organizationId, saveBroadcast])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/broadcasts">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">New Broadcast</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Send an email to your audience
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
            variant="outline"
            size="sm" 
            className="h-8 text-[13px]"
            onClick={() => saveBroadcast(true)}
            disabled={saving}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Draft
          </Button>
          <Button 
            size="sm" 
            className="h-8 text-[13px]"
            onClick={sendBroadcast}
            disabled={sending || saving}
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 mr-1.5" />
            )}
            Send Now
          </Button>
        </div>
      </div>

      {/* Audience Selection */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Users className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Recipients</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Choose who will receive this broadcast
              </p>
            </div>
          </div>
          {contactCount > 0 && (
            <div className="text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">{contactCount.toLocaleString()}</span> contacts
            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-5">
          <div className="space-y-2">
            <Label htmlFor="audience" className="text-[13px]">Select Audience</Label>
            <Select value={audienceId} onValueChange={setAudienceId}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Choose an audience..." />
              </SelectTrigger>
              <SelectContent>
                {audiences.length === 0 ? (
                  <div className="px-2 py-4 text-center text-[13px] text-muted-foreground">
                    No audiences yet. <Link href="/audience" className="text-primary underline">Create one</Link>
                  </div>
                ) : (
                  audiences.map((audience) => (
                    <SelectItem key={audience.id} value={audience.id} className="text-[13px]">
                      {audience.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sender Details */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Mail className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Sender Details</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Configure the from address
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fromName" className="text-[13px]">From Name</Label>
              <Input
                id="fromName"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="e.g., John from Acme"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail" className="text-[13px]">From Email</Label>
              <div className="flex gap-2">
                <Input
                  id="fromEmail"
                  value={fromEmail.split('@')[0] || ''}
                  onChange={(e) => {
                    const domain = fromEmail.split('@')[1] || (domains[0]?.domain || '')
                    setFromEmail(`${e.target.value}@${domain}`)
                  }}
                  placeholder="hello"
                  className="h-9 text-[13px]"
                />
                <Select 
                  value={fromEmail.split('@')[1] || ''} 
                  onValueChange={(domain) => {
                    const local = fromEmail.split('@')[0] || 'hello'
                    setFromEmail(`${local}@${domain}`)
                  }}
                >
                  <SelectTrigger className="h-9 text-[13px] w-[200px]">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.length === 0 ? (
                      <div className="px-2 py-4 text-center text-[13px] text-muted-foreground">
                        No verified domains. <Link href="/domains" className="text-primary underline">Add one</Link>
                      </div>
                    ) : (
                      domains.map((d) => (
                        <SelectItem key={d.domain} value={d.domain} className="text-[13px]">
                          @{d.domain}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="replyTo" className="text-[13px]">Reply-To (optional)</Label>
            <Input
              id="replyTo"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="e.g., support@yourcompany.com"
              className="h-9 text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Broadcast Details */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Radio className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Broadcast Details</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Name and subject for your broadcast
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[13px]">Broadcast Name (internal)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., March Newsletter"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-[13px]">Email Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Your weekly update is here!"
                className="h-9 text-[13px]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[13px]">Use Template (optional)</Label>
            <Select 
              value={templateId || "none"} 
              onValueChange={(value) => setTemplateId(value === "none" ? "" : value)}
            >
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Start from scratch or choose a template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-[13px]">Start from scratch</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id} className="text-[13px]">
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                Write your email content
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
  <title>Email</title>
</head>
<body>
  <h1>Hello {{first_name}}!</h1>
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
                placeholder="Plain text version of your email..."
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

      {/* Schedule (Optional) */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Clock className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Schedule (Optional)</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Send later at a specific time
              </p>
            </div>
          </div>
          {scheduledDate && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[12px]"
              onClick={() => {
                setScheduledDate(undefined)
                setScheduledTime('')
              }}
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="text-[13px]">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-[200px] justify-start text-left text-[13px] font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[13px]">Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="h-9 w-[150px] text-[13px]"
              />
            </div>
          </div>
          
          {scheduledDate && (
            <p className="mt-3 text-[12px] text-muted-foreground">
              Scheduled for: {format(scheduledDate, "PPPP")} {scheduledTime && `at ${scheduledTime}`}
            </p>
          )}
        </div>
      </div>

      {/* Variable Reference */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="p-4 sm:p-5 border-b border-stone-100">
          <h2 className="font-semibold text-[15px]">Personalization Variables</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Use these variables in your content</p>
        </div>
        
        <div className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { var: '{{email}}', desc: 'Recipient email' },
              { var: '{{first_name}}', desc: 'First name' },
              { var: '{{last_name}}', desc: 'Last name' },
              { var: '{{unsubscribe_url}}', desc: 'Unsubscribe link' },
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
