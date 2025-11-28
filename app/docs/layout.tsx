'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { CommandPalette } from '@/components/command-palette'
import { Search, Menu } from 'lucide-react'

interface DocsLayoutProps {
  children: React.ReactNode
}

const sidebarNav = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Quick Start', href: '/docs/quickstart' },
      { title: 'Authentication', href: '/docs/authentication' },
    ]
  },
  {
    title: 'API Reference',
    items: [
      { title: 'Emails', href: '/docs/api/emails' },
      { title: 'Domains', href: '/docs/api/domains' },
      { title: 'API Keys', href: '/docs/api/api-keys' },
      { title: 'Audiences', href: '/docs/api/audiences' },
      { title: 'Contacts', href: '/docs/api/contacts' },
      { title: 'Webhooks', href: '/docs/api/webhooks' },
      { title: 'Templates', href: '/docs/api/templates' },
    ]
  },
  {
    title: 'SDKs',
    items: [
      { title: 'Node.js', href: '/docs/sdks/nodejs' },
      { title: 'Python', href: '/docs/sdks/python' },
      { title: 'Go', href: '/docs/sdks/go' },
      { title: 'PHP', href: '/docs/sdks/php' },
      { title: 'Ruby', href: '/docs/sdks/ruby' },
    ]
  },
  {
    title: 'Guides',
    items: [
      { title: 'Domain Verification', href: '/docs/guides/domain-verification' },
      { title: 'Sending Emails', href: '/docs/guides/sending-emails' },
      { title: 'Using Templates', href: '/docs/guides/templates' },
      { title: 'Audiences & Contacts', href: '/docs/guides/audiences' },
      { title: 'Webhook Events', href: '/docs/guides/webhooks' },
      { title: 'Deliverability', href: '/docs/guides/deliverability' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { title: 'Rate Limits', href: '/docs/rate-limits' },
      { title: 'Error Codes', href: '/docs/errors' },
      { title: 'Changelog', href: '/docs/changelog' },
    ]
  },
]

export default function DocsLayout({ children }: DocsLayoutProps) {
  const openCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <CommandPalette />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/Logo.svg" alt="Unosend" width={120} height={28} className="h-7 w-auto" />
              </Link>
              <Badge variant="secondary" className="text-[10px] bg-stone-100 text-stone-600 border-0">
                Docs
              </Badge>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <button 
                onClick={openCommandPalette}
                className="relative w-full flex items-center gap-2 h-9 pl-9 pr-4 text-[13px] text-stone-500 bg-white border border-stone-200 rounded-lg hover:border-stone-300 transition-colors text-left"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <span>Search documentation...</span>
                <div className="ml-auto flex items-center gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 text-[13px]">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="h-8 text-[13px]">
                  Get Started
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-stone-200 h-[calc(100vh-56px)] sticky top-14 overflow-y-auto">
          <nav className="p-4 space-y-6">
            {sidebarNav.map((section) => (
              <div key={section.title}>
                <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 px-2">
                  {section.title}
                </h4>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link 
                        href={item.href}
                        className="block px-2 py-1.5 text-[13px] text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
