'use client'

import { useState, useEffect } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { codeToHtml } from 'shiki'

// Auto-detect language from filename
function detectLanguage(filename?: string, explicitLang?: string): string {
  if (explicitLang) return explicitLang
  if (!filename) return 'typescript'
  
  const ext = filename.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'tsx',
    'js': 'javascript',
    'jsx': 'jsx',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'java': 'java',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'css': 'css',
    'html': 'html',
    'xml': 'xml',
    'sql': 'sql',
    'env': 'bash',
  }
  
  // Check filename patterns
  if (filename.toLowerCase().includes('node')) return 'bash'
  if (filename.toLowerCase().includes('python')) return 'bash'
  if (filename.toLowerCase().includes('go')) return 'bash'
  if (filename.toLowerCase().includes('terminal')) return 'bash'
  if (filename.toLowerCase().includes('bash')) return 'bash'
  if (filename.toLowerCase() === '.env' || filename.toLowerCase().includes('.env')) return 'bash'
  
  return langMap[ext || ''] || 'typescript'
}

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({ 
  code, 
  language,
  filename,
  showLineNumbers = false,
  className 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  const detectedLanguage = detectLanguage(filename, language)

  useEffect(() => {
    async function highlight() {
      try {
        const html = await codeToHtml(code, {
          lang: detectedLanguage,
          theme: 'github-light',
        })
        setHighlightedCode(html)
      } catch {
        // Fallback to plain text if language not supported
        setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`)
      } finally {
        setIsLoading(false)
      }
    }
    highlight()
  }, [code, detectedLanguage])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("bg-white border border-stone-200 rounded-xl overflow-hidden", className)}>
      {filename && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
            </div>
            <span className="ml-3 text-[12px] text-muted-foreground font-medium">{filename}</span>
          </div>
          <button 
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition p-1 rounded hover:bg-stone-100"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
      <div className="relative">
        {!filename && (
          <button 
            onClick={handleCopy}
            className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground transition p-1.5 rounded hover:bg-stone-100"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        {isLoading ? (
          <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
            <code className="text-stone-500">{code}</code>
          </pre>
        ) : (
          <div 
            className={cn(
              "shiki-wrapper overflow-x-auto text-[13px] leading-relaxed [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:m-0 [&_code]:font-mono",
              showLineNumbers && "[&_.line]:before:content-[counter(line)] [&_.line]:before:counter-increment-[line] [&_.line]:before:text-stone-400 [&_.line]:before:mr-4 [&_.line]:before:inline-block [&_.line]:before:w-4 [&_.line]:before:text-right [&_pre]:counter-reset-[line]"
            )}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        )}
      </div>
    </div>
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

interface InlineCodeProps {
  children: React.ReactNode
  className?: string
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code className={cn(
      "px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[13px] font-mono",
      className
    )}>
      {children}
    </code>
  )
}
