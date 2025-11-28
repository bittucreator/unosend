'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({ 
  code, 
  filename,
  showLineNumbers = false,
  className 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  return (
    <div className={cn("bg-white border border-stone-200/60 rounded-xl overflow-hidden", className)}>
      {filename && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
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
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition p-1.5 rounded hover:bg-stone-100"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
          <code className="text-stone-700">
            {showLineNumbers ? (
              lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="text-stone-400 select-none w-8 text-right mr-4 shrink-0">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  )
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
