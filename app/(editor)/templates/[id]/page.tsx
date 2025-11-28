'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Eye,
  Copy, 
  Trash2,
  MoreHorizontal,
  Code,
  ArrowLeft
} from 'lucide-react'
import { EmailStylesPanel, defaultStyles, type EmailStyles } from '@/components/dashboard/email-styles-panel'

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [showStyles, setShowStyles] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [styles, setStyles] = useState<EmailStyles>(defaultStyles)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Suppress unused variable warnings
  void lastSaved

  // Load template on mount
  useEffect(() => {
    async function loadTemplate() {
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
        
        // Load the template
        const { data: template, error: templateError } = await supabase
          .from('templates')
          .select('*')
          .eq('id', templateId)
          .eq('organization_id', membership.organization_id)
          .single()
        
        if (templateError || !template) {
          setError('Template not found')
          setLoading(false)
          return
        }
        
        setName(template.name || '')
        setSubject(template.subject || '')
        setHtmlContent(template.html_content || '')
        setPreviewText(template.text_content || '')
      }
      
      setLoading(false)
    }
    loadTemplate()
  }, [router, templateId])

  // Save template function
  const saveTemplate = useCallback(async (publish = false) => {
    if (!organizationId || !templateId) return
    
    setSaveStatus('saving')
    setSaving(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      const { error: updateError } = await supabase
        .from('templates')
        .update({
          name: name || 'Untitled Template',
          subject: subject || '(No subject)',
          html_content: htmlContent || null,
          text_content: previewText || null,
        })
        .eq('id', templateId)

      if (updateError) {
        throw updateError
      }

      setLastSaved(new Date())
      setSaveStatus('saved')
      
      if (publish) {
        router.push('/templates')
      }
    } catch (err) {
      console.error('Failed to save template:', err)
      setError('Failed to save template. Please try again.')
      setSaveStatus('unsaved')
    } finally {
      setSaving(false)
    }
  }, [organizationId, templateId, name, subject, htmlContent, previewText, router])

  // Debounced auto-save
  useEffect(() => {
    if (!organizationId || loading) return
    
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
  }, [name, subject, htmlContent, previewText, organizationId, loading, saveTemplate])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saveStatus])

  const handlePublish = () => saveTemplate(true)

  const handleDuplicate = async () => {
    if (!organizationId) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('templates')
        .insert({
          organization_id: organizationId,
          name: `${name} (Copy)`,
          subject: subject || '(No subject)',
          type: 'html',
          html_content: htmlContent,
          text_content: previewText,
        })
      
      if (error) throw error
      router.push('/templates')
    } catch (err) {
      console.error('Failed to duplicate:', err)
      setError('Failed to duplicate template')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const supabase = createClient()
      await supabase
        .from('templates')
        .delete()
        .eq('id', templateId)
      
      router.push('/templates')
    } catch (err) {
      console.error('Failed to delete:', err)
      setError('Failed to delete template')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    )
  }

  if (error === 'Template not found') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Template not found</p>
          <Link href="/templates">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/templates" className="text-stone-500 hover:text-stone-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-medium border-0 bg-transparent px-0 h-auto focus-visible:ring-0 w-64"
              placeholder="Template name"
            />
            <Badge variant="secondary" className="text-[11px]">
              {saveStatus === 'saving' && (
                <>
                  <Cloud className="w-3 h-3 mr-1 animate-pulse" />
                  Saving...
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3 h-3 mr-1 text-green-600" />
                  Saved
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <Cloud className="w-3 h-3 mr-1" />
                  Unsaved
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className={previewMode ? 'bg-stone-100' : ''}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStyles(!showStyles)}
              className={showStyles ? 'bg-stone-100' : ''}
            >
              <Palette className="w-4 h-4 mr-1.5" />
              Styles
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button size="sm" onClick={handlePublish} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Save & Close'
              )}
            </Button>
          </div>
        </div>
      </header>
      
      {error && error !== 'Template not found' && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex">
        {/* Editor Panel */}
        <div className={`flex-1 flex flex-col ${showStyles ? 'mr-80' : ''}`}>
          {/* Subject Line */}
          <div className="bg-white border-b border-stone-200 px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-medium text-stone-700">Email Details</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Subject Line</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject line..."
                  className="text-[14px]"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Preview Text</label>
                <Input
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Preview text shown in inbox..."
                  className="text-[14px]"
                />
              </div>
            </div>
          </div>

          {/* HTML Editor or Preview */}
          <div className="flex-1 p-6 overflow-auto">
            {previewMode ? (
              <div className="bg-white rounded-lg border border-stone-200 p-6 max-w-2xl mx-auto">
                <div className="mb-4 pb-4 border-b border-stone-100">
                  <p className="text-sm text-stone-500">Subject: {subject || '(No subject)'}</p>
                </div>
                <div 
                  className="prose prose-stone max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-stone-400">No content yet</p>' }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-stone-200 overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-100 bg-stone-50">
                  <Code className="w-4 h-4 text-stone-400" />
                  <span className="text-xs font-medium text-stone-600">HTML Editor</span>
                </div>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Enter your HTML email content here..."
                  className="flex-1 p-4 font-mono text-[13px] resize-none focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Styles Panel */}
        {showStyles && (
          <div className="w-80 fixed right-0 top-[57px] bottom-0 bg-white border-l border-stone-200 overflow-auto">
            <EmailStylesPanel styles={styles} onChange={setStyles} />
          </div>
        )}
      </div>
    </div>
  )
}
