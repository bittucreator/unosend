'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Check, Send } from 'lucide-react'

type AnimationState = 'code' | 'verify' | 'sent'

// Simple syntax highlighting
function highlightCode(code: string): React.ReactNode[] {
  const lines = code.split('\n')
  
  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = []
    let remaining = line
    let keyIndex = 0
    
    const patterns: [RegExp, string][] = [
      [/^('[^']*'|"[^"]*")/, 'text-emerald-600'],
      [/^`[^`]*`/, 'text-emerald-600'],
      [/^(await|async|const|let|var|function|return|if|else|for|while|import|export|from|new|class|extends|try|catch|throw)\b/, 'text-purple-600'],
      [/^(fetch|JSON|console|Promise|Array|Object|String|Number|Boolean)\b/, 'text-blue-600'],
      [/^(stringify|parse|log|then|catch|finally)\b/, 'text-amber-600'],
      [/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/, 'text-sky-600'],
      [/^(POST|GET|PUT|DELETE|PATCH)\b/, 'text-rose-600'],
      [/^https?:\/\/[^\s'"]+/, 'text-cyan-600'],
      [/^\d+/, 'text-orange-500'],
      [/^\/\/.*$/, 'text-stone-400'],
      [/^[{}[\](),;.]/, 'text-stone-500'],
      [/^[=+\-*/<>!&|]+/, 'text-stone-500'],
    ]
    
    while (remaining.length > 0) {
      const wsMatch = remaining.match(/^\s+/)
      if (wsMatch) {
        tokens.push(<span key={`${lineIndex}-${keyIndex++}`}>{wsMatch[0]}</span>)
        remaining = remaining.slice(wsMatch[0].length)
        continue
      }
      
      let matched = false
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

const codeString = `await fetch('https://api.unosend.com/v1/emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer un_xxx...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Hello World',
    html: '<p>Welcome to Unosend!</p>'
  })
});`

const lines = codeString.split('\n')

export function HeroAnimation() {
  const [state, setState] = useState<AnimationState>('code')
  const [displayedLines, setDisplayedLines] = useState(0)
  const [verifyProgress, setVerifyProgress] = useState(0)
  const [verified, setVerified] = useState(false)
  const [showCheck, setShowCheck] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const resetAnimation = useCallback(() => {
    setDisplayedLines(0)
    setVerifyProgress(0)
    setVerified(false)
    setShowCheck(false)
    setState('code')
  }, [])

  // Main animation loop
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (state === 'code') {
      if (displayedLines < lines.length) {
        timerRef.current = setTimeout(() => {
          setDisplayedLines(d => d + 1)
        }, 80)
      } else {
        timerRef.current = setTimeout(() => {
          setState('verify')
        }, 800)
      }
    } else if (state === 'verify') {
      if (verifyProgress < 100) {
        timerRef.current = setTimeout(() => {
          setVerifyProgress(p => Math.min(p + 3, 100))
        }, 25)
      } else if (!verified) {
        timerRef.current = setTimeout(() => {
          setVerified(true)
        }, 200)
      } else {
        timerRef.current = setTimeout(() => {
          setState('sent')
        }, 600)
      }
    } else if (state === 'sent') {
      if (!showCheck) {
        timerRef.current = setTimeout(() => {
          setShowCheck(true)
        }, 200)
      } else {
        timerRef.current = setTimeout(() => {
          resetAnimation()
        }, 2500)
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [state, displayedLines, verifyProgress, verified, showCheck, resetAnimation])

  const visibleCode = lines.slice(0, displayedLines).join('\n')
  const highlightedCode = highlightCode(visibleCode)
  const isTyping = state === 'code' && displayedLines < lines.length

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Code State */}
      <div className={`transition-all duration-300 ${state === 'code' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden text-left">
          {/* Window header */}
          <div className="flex items-center px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <span className="ml-3 text-[12px] text-muted-foreground font-medium">send-email.ts</span>
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

          {/* Footer */}
          <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/30 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {isTyping ? 'Typing...' : '✓ Ready to send'}
            </span>
            <span className="text-[10px] text-muted-foreground opacity-60">
              {displayedLines}/{lines.length} lines
            </span>
          </div>
        </div>
      </div>

      {/* Verify State */}
      <div className={`transition-all duration-300 ${state === 'verify' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden text-left">
          {/* Window header */}
          <div className="flex items-center px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <span className="ml-3 text-[12px] text-muted-foreground font-medium">API Verification</span>
          </div>
          
          {/* Verify content */}
          <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
            {/* Progress circle */}
            <div className="relative mb-5">
              {!verified ? (
                <div className="relative">
                  <svg className="w-14 h-14" viewBox="0 0 56 56">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="#f5f5f4"
                      strokeWidth="3"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray={`${verifyProgress * 1.51} 151`}
                      strokeLinecap="round"
                      transform="rotate(-90 28 28)"
                      className="transition-all duration-75"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-stone-600">{verifyProgress}%</span>
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-[200px]">
              <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-75 ${verified ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${verifyProgress}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-4">
              {verified ? '✓ API key verified' : 'Verifying API credentials...'}
            </p>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/30 flex items-center justify-center">
            <span className={`text-[10px] ${verified ? 'text-emerald-600' : 'text-blue-600'}`}>
              {verified ? 'Authentication complete' : 'Authenticating...'}
            </span>
          </div>
        </div>
      </div>

      {/* Sent State */}
      <div className={`transition-all duration-300 ${state === 'sent' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden text-left">
          {/* Window header */}
          <div className="flex items-center px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <span className="ml-3 text-[12px] text-muted-foreground font-medium">Email Sent</span>
          </div>
          
          {/* Sent content */}
          <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
            {/* Success icon */}
            <div className={`transition-all duration-300 ${showCheck ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Delivered badge */}
            <div className={`transition-all duration-300 delay-100 ${showCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Delivered</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-4">
              Email sent to user@example.com
            </p>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-stone-100 bg-emerald-50/50 flex items-center justify-center gap-1.5">
            <span className="text-[10px] text-emerald-600">
              ✓ Delivered in 47ms
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
