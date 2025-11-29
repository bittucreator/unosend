'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { TimePicker } from '@/components/ui/time-picker'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  Clock,
  Trash2,
  Copy,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Audience {
  id: string
  name: string
}

interface Domain {
  domain: string
}

export default function EditBroadcastPage() {
  const router = useRouter()
  const params = useParams()
  const broadcastId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('edit')
  const [broadcastStatus, setBroadcastStatus] = useState<string>('draft')
  
  // Form fields
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [audienceId, setAudienceId] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [textContent, setTextContent] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState('')
  
  // Stats
  const [sentCount, setSentCount] = useState(0)
  const [totalRecipients, setTotalRecipients] = useState(0)
  
  // Data
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [contactCount, setContactCount] = useState(0)
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load broadcast
  useEffect(() => {
    async function loadBroadcast() {
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

      // Load broadcast
      const { data: broadcast, error } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('id', broadcastId)
        .eq('organization_id', membership.organization_id)
        .single()
      
      if (error || !broadcast) {
        toast.error('Broadcast not found')
        router.push('/broadcasts')
        return
      }
      
      setName(broadcast.name || '')
      setSubject(broadcast.subject || '')
      setFromEmail(broadcast.from_email || '')
      setFromName(broadcast.from_name || '')
      setReplyTo(broadcast.reply_to || '')
      setAudienceId(broadcast.audience_id || '')
      setHtmlContent(broadcast.html_content || '')
      setTextContent(broadcast.text_content || '')
      setBroadcastStatus(broadcast.status)
      setSentCount(broadcast.sent_count || 0)
      setTotalRecipients(broadcast.total_recipients || 0)
      
      if (broadcast.scheduled_at) {
        const date = new Date(broadcast.scheduled_at)
        setScheduledDate(date)
        setScheduledTime(format(date, 'HH:mm'))
      }

      // Load audiences and domains
      const [audiencesRes, domainsRes] = await Promise.all([
        supabase.from('audiences').select('id, name').eq('organization_id', membership.organization_id),
        supabase.from('domains').select('domain').eq('organization_id', membership.organization_id).eq('status', 'verified')
      ])

      setAudiences(audiencesRes.data || [])
      setDomains(domainsRes.data || [])
      setLoading(false)
    }
    loadBroadcast()
  }, [router, broadcastId])

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

  // Save broadcast
  const saveBroadcast = useCallback(async (redirect = false) => {
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
      
      const response = await fetch('/api/dashboard/broadcasts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: broadcastId,
          name: name || 'Untitled Broadcast',
          subject: subject || '(No subject)',
          from_email: fromEmail || 'noreply@example.com',
          from_name: fromName || null,
          reply_to: replyTo || null,
          audience_id: audienceId || null,
          html_content: htmlContent || null,
          text_content: textContent || null,
          scheduled_at: scheduledAt,
          total_recipients: contactCount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
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
      // Save first
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

  // Duplicate broadcast
  const handleDuplicate = async () => {
    if (!organizationId) return
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('broadcasts')
        .insert({
          organization_id: organizationId,
          name: `${name} (Copy)`,
          subject,
          from_email: fromEmail,
          from_name: fromName,
          reply_to: replyTo,
          audience_id: audienceId,
          html_content: htmlContent,
          text_content: textContent,
          status: 'draft',
        })
        .select('id')
        .single()
      
      if (error) throw error
      toast.success('Broadcast duplicated')
      router.push(`/broadcasts/${data.id}`)
    } catch (err) {
      console.error('Failed to duplicate:', err)
      toast.error('Failed to duplicate broadcast')
    }
  }

  // Delete broadcast
  const handleDelete = async () => {
    if (!organizationId) return
    
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('broadcasts')
        .delete()
        .eq('id', broadcastId)
      
      if (error) throw error
      toast.success('Broadcast deleted')
      router.push('/broadcasts')
    } catch (err) {
      console.error('Failed to delete:', err)
      toast.error('Failed to delete broadcast')
    } finally {
      setDeleting(false)
    }
  }

  // Auto-save (only for drafts)
  useEffect(() => {
    if (!organizationId || loading || broadcastStatus !== 'draft') return
    
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
  }, [name, subject, htmlContent, textContent, fromEmail, fromName, audienceId, organizationId, loading, broadcastStatus, saveBroadcast])

  const isEditable = broadcastStatus === 'draft'
  const isSent = broadcastStatus === 'sent' || broadcastStatus === 'sending'

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
          <Link href="/broadcasts">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{name || 'Untitled Broadcast'}</h1>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[11px]",
                  broadcastStatus === 'sent' && "bg-green-50 text-green-700",
                  broadcastStatus === 'sending' && "bg-blue-50 text-blue-700",
                  broadcastStatus === 'scheduled' && "bg-purple-50 text-purple-700",
                  broadcastStatus === 'draft' && "bg-stone-100 text-stone-700"
                )}
              >
                {broadcastStatus}
              </Badge>
            </div>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {isSent ? `Sent to ${sentCount.toLocaleString()} of ${totalRecipients.toLocaleString()} recipients` : 'Edit your broadcast'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditable && (
            <>
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
            </>
          )}
          
          <Button 
            variant="outline"
            size="sm" 
            className="h-8 text-[13px]"
            onClick={handleDuplicate}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Duplicate
          </Button>
          
          {isEditable && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm" 
                  className="h-8 text-[13px] text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Broadcast</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this broadcast? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          {isEditable && (
            <>
              <Button 
                variant="outline"
                size="sm" 
                className="h-8 text-[13px]"
                onClick={() => saveBroadcast(true)}
                disabled={saving}
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
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
            </>
          )}
        </div>
      </div>

      {/* Stats for sent broadcasts */}
      {isSent && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <div className="border border-stone-200 rounded-xl bg-white p-4">
            <p className="text-[13px] text-muted-foreground">Sent</p>
            <p className="text-2xl font-semibold mt-1">{sentCount.toLocaleString()}</p>
          </div>
          <div className="border border-stone-200 rounded-xl bg-white p-4">
            <p className="text-[13px] text-muted-foreground">Recipients</p>
            <p className="text-2xl font-semibold mt-1">{totalRecipients.toLocaleString()}</p>
          </div>
          <div className="border border-stone-200 rounded-xl bg-white p-4">
            <p className="text-[13px] text-muted-foreground">Delivery Rate</p>
            <p className="text-2xl font-semibold mt-1">
              {totalRecipients > 0 ? Math.round((sentCount / totalRecipients) * 100) : 0}%
            </p>
          </div>
          <div className="border border-stone-200 rounded-xl bg-white p-4">
            <p className="text-[13px] text-muted-foreground">Status</p>
            <p className="text-2xl font-semibold mt-1 capitalize">{broadcastStatus}</p>
          </div>
        </div>
      )}

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
                {isSent ? 'Audience this was sent to' : 'Choose who will receive this broadcast'}
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
            <Label htmlFor="audience" className="text-[13px]">Audience</Label>
            <Select value={audienceId} onValueChange={setAudienceId} disabled={!isEditable}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Choose an audience..." />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((audience) => (
                  <SelectItem key={audience.id} value={audience.id} className="text-[13px]">
                    {audience.name}
                  </SelectItem>
                ))}
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
                From address configuration
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
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail" className="text-[13px]">From Email</Label>
              <Input
                id="fromEmail"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="e.g., hello@yourcompany.com"
                className="h-9 text-[13px]"
                disabled={!isEditable}
              />
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
              disabled={!isEditable}
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
                Name and subject
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
                disabled={!isEditable}
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
                disabled={!isEditable}
              />
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
                {isSent ? 'View email content' : 'Write your email content'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit" className="text-[13px]">
                <Code className="w-3.5 h-3.5 mr-1.5" />
                HTML
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
                placeholder="HTML content..."
                className="w-full h-[400px] p-4 font-mono text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
                disabled={!isEditable}
              />
            </TabsContent>
            
            <TabsContent value="text" className="mt-0">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Plain text version..."
                className="w-full h-[400px] p-4 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
                disabled={!isEditable}
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

      {/* Schedule (only for drafts) */}
      {isEditable && (
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
                <TimePicker
                  value={scheduledTime}
                  onChange={setScheduledTime}
                  className="w-[150px]"
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
      )}
    </div>
  )
}
