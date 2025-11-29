'use client'

import { useEffect, useState } from 'react'

interface AnimatedCodeBlockProps {
  code: string
  filename?: string
}

// Simple syntax highlighting for TypeScript/JavaScript
function highlightCode(code: string): React.ReactNode[] {
  const lines = code.split('\n')
  
  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = []
    let remaining = line
    let keyIndex = 0
    
    // Process the line character by character with regex patterns
    const patterns: [RegExp, string][] = [
      // Strings (single and double quotes)
      [/^('[^']*'|"[^"]*")/, 'text-emerald-600'],
      // Template literals
      [/^`[^`]*`/, 'text-emerald-600'],
      // Keywords
      [/^(await|async|const|let|var|function|return|if|else|for|while|import|export|from|new|class|extends|try|catch|throw)\b/, 'text-purple-600'],
      // Built-in objects and methods
      [/^(fetch|JSON|console|Promise|Array|Object|String|Number|Boolean)\b/, 'text-blue-600'],
      // Method calls
      [/^(stringify|parse|log|then|catch|finally)\b/, 'text-amber-600'],
      // Properties/keys before colon
      [/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/, 'text-sky-600'],
      // HTTP methods
      [/^(POST|GET|PUT|DELETE|PATCH)\b/, 'text-rose-600'],
      // URLs
      [/^https?:\/\/[^\s'"]+/, 'text-cyan-600'],
      // Numbers
      [/^\d+/, 'text-orange-500'],
      // Comments
      [/^\/\/.*$/, 'text-stone-400'],
      // Punctuation
      [/^[{}[\](),;.]/, 'text-stone-500'],
      // Operators
      [/^[=+\-*/<>!&|]+/, 'text-stone-500'],
    ]
    
    while (remaining.length > 0) {
      let matched = false
      
      // Check for whitespace first
      const wsMatch = remaining.match(/^\s+/)
      if (wsMatch) {
        tokens.push(<span key={`${lineIndex}-${keyIndex++}`}>{wsMatch[0]}</span>)
        remaining = remaining.slice(wsMatch[0].length)
        continue
      }
      
      for (const [pattern, className] of patterns) {
        const match = remaining.match(pattern)
        if (match) {
          tokens.push(
            <span key={`${lineIndex}-${keyIndex++}`} className={className}>
              {match[0]}
            </span>
          )
          remaining = remaining.slice(match[0].length)
          matched = true
          break
        }
      }
      
      if (!matched) {
        // Default text color for unmatched characters
        const nextSpecial = remaining.search(/[\s{}[\](),;.=+\-*/<>!&|'"`:@]/)
        const chunk = nextSpecial === -1 ? remaining : remaining.slice(0, nextSpecial || 1)
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-stone-700">
            {chunk}
          </span>
        )
        remaining = remaining.slice(chunk.length)
      }
    }
    
    return (
      <div key={lineIndex} className="leading-relaxed">
        {tokens.length > 0 ? tokens : ' '}
      </div>
    )
  })
}

export function AnimatedCodeBlock({ code, filename = 'send-email.ts' }: AnimatedCodeBlockProps) {
  const [displayedLines, setDisplayedLines] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const lines = code.split('\n')
  
  useEffect(() => {
    if (displayedLines < lines.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => prev + 1)
      }, 80) // Speed of typing animation
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [displayedLines, lines.length])
  
  const visibleCode = lines.slice(0, displayedLines).join('\n')
  const highlightedCode = highlightCode(visibleCode)
  
  return (
    <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden text-left shadow-sm">
      {/* Window header */}
      <div className="flex items-center px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
        <span className="ml-3 text-[12px] text-muted-foreground font-medium">{filename}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] text-emerald-600 font-medium">TypeScript</span>
        </div>
      </div>
      
      {/* Code content */}
      <div className="p-4 overflow-x-auto font-mono text-[12px] bg-[#fefefe] min-h-[200px]">
        <pre className="relative">
          <code>{highlightedCode}</code>
          {isTyping && (
            <span className="inline-block w-2 h-4 bg-stone-900 animate-pulse ml-0.5 align-middle" />
          )}
        </pre>
      </div>
      
      {/* Footer with copy hint */}
      <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {isTyping ? 'Typing...' : '✓ Ready to send'}
        </span>
        <span className="text-[10px] text-muted-foreground opacity-60">
          3 lines • 250 bytes
        </span>
      </div>
    </div>
  )
}
