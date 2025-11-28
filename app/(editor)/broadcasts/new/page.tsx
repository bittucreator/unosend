'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { 
  Palette, 
  Loader2, 
  Check, 
  Cloud, 
  Mail, 
  History, 
  Eye, 
  Copy, 
  Trash2,
  MoreHorizontal,
  Code,
  CalendarIcon
} from 'lucide-react'
import { EmailStylesPanel, defaultStyles, type EmailStyles } from '@/components/dashboard/email-styles-panel'
import { cn } from '@/lib/utils'

interface Audience {
  id: string
  name: string
}

interface Domain {
  domain: string
}

export default function NewBroadcastPage() {
  const router = useRouter()
  const [broadcastId, setBroadcastId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('unsaved')
  const [showStyles, setShowStyles] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [name, setName] = useState('Untitled')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [replyTo] = useState('')
  const [audienceId, setAudienceId] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [styles, setStyles] = useState<EmailStyles>(defaultStyles)
  const [error, setError] = useState<string | null>(null)
  
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [organizationId, setOrganizationId] = useState('')
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitialContent = useRef(false)

  // Suppress unused variable warnings
  void lastSaved
  void replyTo

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

      const [audiencesRes, domainsRes] = await Promise.all([
        supabase.from('audiences').select('id, name').eq('organization_id', membership.organization_id),
        supabase.from('domains').select('domain').eq('organization_id', membership.organization_id).eq('status', 'verified')
      ])

      setAudiences(audiencesRes.data || [])
      setDomains(domainsRes.data || [])
    }
    loadData()
  }, [router])

  // Save broadcast function
  const saveBroadcast = useCallback(async (sendNow = false) => {
    if (!organizationId) {
      setError('No organization found. Please refresh the page.')
      return
    }
    
    // Don't auto-save if no real content yet
    if (!hasInitialContent.current && !subject && !htmlContent) {
      return
    }
    
    setSaveStatus('saving')
    setSending(sendNow)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // from_email is required by database - use placeholder if empty
      const broadcastData = {
        organization_id: organizationId,
        name: name || 'Untitled',
        subject: subject || '(No subject)',
        from_email: fromEmail || 'noreply@example.com',
        from_name: fromName || null,
        audience_id: audienceId || null,
        html_content: htmlContent || null,
        status: sendNow ? 'sending' : 'draft',
        scheduled_at: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      }

      if (broadcastId) {
        const { error: updateError } = await supabase
          .from('broadcasts')
          .update(broadcastData)
          .eq('id', broadcastId)

        if (updateError) throw updateError
      } else {
        const { data, error: insertError } = await supabase
          .from('broadcasts')
          .insert(broadcastData)
          .select('id')
          .single()

        if (insertError) throw insertError
        if (data) {
          setBroadcastId(data.id)
          hasInitialContent.current = true
        }
      }

      setLastSaved(new Date())
      setSaveStatus('saved')
      
      if (sendNow) {
        router.push('/broadcasts')
      }
    } catch (err) {
      console.error('Failed to save broadcast:', err)
      setError('Failed to save broadcast. Please try again.')
      setSaveStatus('unsaved')
    } finally {
      setSending(false)
    }
  }, [organizationId, broadcastId, name, subject, htmlContent, fromEmail, fromName, audienceId, scheduledFor, router])

  // Track when user starts entering content
  useEffect(() => {
    if (subject || htmlContent) {
      hasInitialContent.current = true
    }
  }, [subject, htmlContent])

  // Debounced auto-save
  useEffect(() => {
    if (!organizationId) return
    if (!hasInitialContent.current) return
    
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
  }, [name, subject, htmlContent, previewText, fromEmail, audienceId, organizationId, saveBroadcast])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved' && hasInitialContent.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saveStatus])

  const handleSend = () => saveBroadcast(true)

  const handleTestEmail = () => {
    const email = prompt('Enter email address to send test:')
    if (email) {
      alert(`Test email would be sent to ${email}`)
    }
  }

  const handleDuplicate = async () => {
    if (!organizationId) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('broadcasts')
        .insert({
          organization_id: organizationId,
          name: `${name} (Copy)`,
          subject: subject || '(No subject)',
          from_email: fromEmail,
          from_name: fromName,
          audience_id: audienceId || null,
          html_content: htmlContent,
          status: 'draft',
        })
        .select('id')
        .single()
      
      if (error) throw error
      router.push('/broadcasts')
    } catch (err) {
      console.error('Failed to duplicate:', err)
      setError('Failed to duplicate broadcast')
    }
  }

  const handleDelete = async () => {
    if (!broadcastId) {
      router.push('/broadcasts')
      return
    }
    
    if (!confirm('Are you sure you want to delete this broadcast?')) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('broadcasts')
        .delete()
        .eq('id', broadcastId)
      
      if (error) throw error
      router.push('/broadcasts')
    } catch (err) {
      console.error('Failed to delete:', err)
      setError('Failed to delete broadcast')
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Navigation - Resend Style */}
      <div className="border-b shrink-0">
        <div className="flex items-center justify-between px-2 sm:px-4 h-12 sm:h-14">
          {/* Left - Breadcrumb */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <Link href="/broadcasts" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">Broadcasts</Link>
            <span className="text-xs sm:text-sm text-muted-foreground">/</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 sm:h-8 w-24 sm:w-40 border-0 bg-transparent font-medium text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Badge variant="secondary" className="gap-1 hidden sm:flex">
              {saveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
              {saveStatus === 'saved' && <Check className="w-3 h-3" />}
              {saveStatus === 'unsaved' && <Cloud className="w-3 h-3" />}
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Draft'}
            </Badge>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Styles toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowStyles(!showStyles)}
              className={`${showStyles ? 'bg-muted' : ''} h-8 px-2 sm:px-3`}
            >
              <Palette className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Styles</span>
            </Button>
            
            {/* Preview toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setPreviewMode(!previewMode)}
              className={`${previewMode ? 'bg-muted' : ''} h-8 px-2 sm:px-3`}
            >
              {previewMode ? <Code className="w-4 h-4 sm:mr-1" /> : <Eye className="w-4 h-4 sm:mr-1" />}
              <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
            </Button>
            
            {/* User avatar - hidden on mobile */}
            <div className="hidden md:flex w-8 h-8 rounded-full bg-violet-500 items-center justify-center text-white text-sm font-medium">
              U
            </div>
            
            {/* Dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleTestEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <History className="w-4 h-4 mr-2" />
                  View History
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Test email button - hidden on mobile */}
            <Button variant="outline" onClick={handleTestEmail} size="sm" className="hidden sm:flex h-8">
              Test email
            </Button>
            
            {/* Send button */}
            <Button onClick={handleSend} disabled={sending || !subject || !fromEmail || !audienceId} size="sm" className="h-8">
              {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Main Content with Styles Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Email Composer */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6 sm:py-12 px-3 sm:px-4">
            <div className="space-y-4 sm:space-y-6">
              {/* From Field */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                <label className="sm:w-20 text-sm font-medium text-muted-foreground sm:pt-2">From</label>
                <div className="flex-1">
                  <Select 
                    value={fromEmail} 
                    onValueChange={(value) => {
                      setFromEmail(value)
                      setFromName(fromName || 'Acme')
                    }}
                  >
                    <SelectTrigger className="border-0 border-b rounded-none px-0 focus:ring-0">
                      <SelectValue placeholder="Select sender email" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.length === 0 ? (
                        <SelectItem value="no-domains" disabled>No verified domains</SelectItem>
                      ) : (
                        domains.flatMap((d) => [
                          <SelectItem key={`hello-${d.domain}`} value={`hello@${d.domain}`}>
                            {fromName || 'Acme'} &lt;hello@{d.domain}&gt;
                          </SelectItem>,
                          <SelectItem key={`noreply-${d.domain}`} value={`noreply@${d.domain}`}>
                            {fromName || 'Acme'} &lt;noreply@{d.domain}&gt;
                          </SelectItem>,
                        ])
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:w-32">
                  <label className="text-sm font-medium text-muted-foreground">Reply-To</label>
                  <Input
                    placeholder=""
                    className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary mt-1"
                  />
                </div>
              </div>

              {/* To Field */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                <label className="sm:w-20 text-sm font-medium text-muted-foreground sm:pt-2">To</label>
                <div className="flex-1">
                  <Select value={audienceId} onValueChange={setAudienceId}>
                    <SelectTrigger className="border-0 border-b rounded-none px-0 focus:ring-0">
                      <SelectValue placeholder="Select a segment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.length === 0 ? (
                        <SelectItem value="no-audiences" disabled>No audiences created</SelectItem>
                      ) : (
                        audiences.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:w-48">
                  <label className="text-sm font-medium text-muted-foreground">When</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left font-normal border-0 border-b rounded-none px-0 mt-1 h-9",
                          !scheduledFor && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledFor ? format(new Date(scheduledFor), "PPP 'at' p") : "Send now"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledFor ? new Date(scheduledFor) : undefined}
                        onSelect={(date) => setScheduledFor(date ? date.toISOString() : '')}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                      <div className="p-3 border-t">
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={scheduledFor ? format(new Date(scheduledFor), 'HH:mm') : ''}
                            onChange={(e) => {
                              if (scheduledFor) {
                                const [hours, minutes] = e.target.value.split(':')
                                const newDate = new Date(scheduledFor)
                                newDate.setHours(parseInt(hours), parseInt(minutes))
                                setScheduledFor(newDate.toISOString())
                              } else {
                                const now = new Date()
                                const [hours, minutes] = e.target.value.split(':')
                                now.setHours(parseInt(hours), parseInt(minutes))
                                setScheduledFor(now.toISOString())
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setScheduledFor('')}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Preview Field */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                <label className="sm:w-20 text-sm font-medium text-muted-foreground sm:pt-2">Preview</label>
                <div className="flex-1">
                  <Input
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Preview text shown in email clients"
                    className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                <label className="sm:w-20 text-sm font-medium text-muted-foreground sm:pt-2">Subject</label>
                <div className="flex-1">
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary text-base sm:text-lg"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t pt-6" />

              {/* Content Area - Styled Email Preview */}
              <div 
                className="min-h-[400px] rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: styles.body.backgroundColor,
                  color: styles.body.color,
                }}
              >
                <div
                  style={{
                    maxWidth: `${styles.container.width}px`,
                    margin: styles.container.align === 'center' ? '0 auto' : 
                            styles.container.align === 'right' ? '0 0 0 auto' : '0',
                    paddingLeft: `${styles.container.paddingLeft}px`,
                    paddingRight: `${styles.container.paddingRight}px`,
                    fontFamily: styles.typography.fontFamily,
                    fontSize: `${styles.typography.fontSize}px`,
                    lineHeight: `${styles.typography.lineHeight}%`,
                  }}
                >
                  {previewMode ? (
                    <div 
                      className="min-h-[400px] p-4 email-preview"
                      dangerouslySetInnerHTML={{ 
                        __html: htmlContent || '<p style="color: #9ca3af;">No content to preview</p>' 
                      }} 
                    />
                  ) : (
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="Start typing your email content here... You can use HTML tags like <h1>, <p>, <a>, <img>, <button> etc."
                      className="w-full min-h-[400px] bg-transparent border-0 resize-none focus:outline-none placeholder:text-muted-foreground/60 p-4 font-mono text-sm"
                      style={{
                        color: 'inherit',
                      }}
                    />
                  )}
                </div>
              </div>
              
              {/* Preview Styles */}
              <style dangerouslySetInnerHTML={{ __html: `
                .email-preview a { color: ${styles.link.color}; text-decoration: ${styles.link.decoration}; }
                .email-preview img { border-radius: ${styles.image.borderRadius}px; max-width: 100%; }
                .email-preview button, .email-preview .button { 
                  background-color: ${styles.button.backgroundColor}; 
                  color: ${styles.button.textColor}; 
                  border-radius: ${styles.button.radius}px;
                  padding: ${styles.button.paddingTop}px ${styles.button.paddingRight}px ${styles.button.paddingBottom}px ${styles.button.paddingLeft}px;
                  border: none;
                  cursor: pointer;
                }
                .email-preview pre, .email-preview code:not(:only-child) { 
                  background-color: ${styles.codeBlock.backgroundColor}; 
                  border-radius: ${styles.codeBlock.borderRadius}px;
                  padding: ${styles.codeBlock.paddingTop}px ${styles.codeBlock.paddingRight}px ${styles.codeBlock.paddingBottom}px ${styles.codeBlock.paddingLeft}px;
                  display: block;
                  overflow-x: auto;
                }
                .email-preview code { 
                  background-color: ${styles.inlineCode.backgroundColor}; 
                  color: ${styles.inlineCode.textColor}; 
                  border-radius: ${styles.inlineCode.radius}px;
                  padding: 2px 6px;
                }
                .email-preview h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
                .email-preview h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }
                .email-preview h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
                .email-preview p { margin: 1em 0; }
                .email-preview ul, .email-preview ol { margin: 1em 0; padding-left: 40px; }
                ${styles.globalCss}
              ` }} />
            </div>
          </div>
        </div>

        {/* Styles Panel - Right side */}
        {showStyles && (
          <EmailStylesPanel styles={styles} onChange={setStyles} onClose={() => setShowStyles(false)} />
        )}
      </div>
    </div>
  )
}
