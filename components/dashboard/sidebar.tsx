'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Mail, 
  Radio,
  FileText,
  Users,
  BarChart3,
  Globe,
  ScrollText,
  Key,
  Webhook,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/emails', label: 'Emails', icon: Mail },
  { href: '/broadcasts', label: 'Broadcasts', icon: Radio },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/audience', label: 'Audience', icon: Users },
  { href: '/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/logs', label: 'Logs', icon: ScrollText },
  { href: '/api-keys', label: 'API Keys', icon: Key },
  { href: '/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r bg-muted/30 min-h-[calc(100vh-3.5rem)]">
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/emails' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                isActive 
                  ? "bg-background text-foreground shadow-sm font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
