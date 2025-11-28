'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'
import {
  Mail,
  Users,
  Key,
  Globe,
  BarChart3,
  FileText,
  Settings,
  Send,
  Webhook,
  LogOut,
  Plus,
  CreditCard,
  BookOpen,
  Megaphone,
  LayoutTemplate,
  Zap,
  Shield,
  Code,
  AlertTriangle,
  History,
  Gauge,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/emails'))}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Emails</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/audience'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Audience</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/broadcasts'))}>
            <Megaphone className="mr-2 h-4 w-4" />
            <span>Broadcasts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/templates'))}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            <span>Templates</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/domains'))}>
            <Globe className="mr-2 h-4 w-4" />
            <span>Domains</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/api-keys'))}>
            <Key className="mr-2 h-4 w-4" />
            <span>API Keys</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/webhooks'))}>
            <Webhook className="mr-2 h-4 w-4" />
            <span>Webhooks</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/logs'))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Logs</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/metrics'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Metrics</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push('/emails?action=compose'))}>
            <Send className="mr-2 h-4 w-4" />
            <span>Compose Email</span>
            <div className="ml-auto flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>E</Kbd>
            </div>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/broadcasts?action=new'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Broadcast</span>
            <div className="ml-auto flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>B</Kbd>
            </div>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/audience?action=add'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Contact</span>
            <div className="ml-auto flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>N</Kbd>
            </div>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/templates?action=new'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Template</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/api-keys?action=new'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Generate API Key</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Settings */}
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <div className="ml-auto flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>,</Kbd>
            </div>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings?tab=billing'))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Documentation */}
        <CommandGroup heading="Documentation">
          <CommandItem onSelect={() => runCommand(() => router.push('/docs'))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Introduction</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/quickstart'))}>
            <Zap className="mr-2 h-4 w-4" />
            <span>Quick Start</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/authentication'))}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Authentication</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* API Reference */}
        <CommandGroup heading="API Reference">
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/api/emails'))}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Emails API</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/api/domains'))}>
            <Globe className="mr-2 h-4 w-4" />
            <span>Domains API</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/api/api-keys'))}>
            <Key className="mr-2 h-4 w-4" />
            <span>API Keys API</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/api/audiences'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Audiences API</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/api/contacts'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Contacts API</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/api/webhooks'))}>
            <Webhook className="mr-2 h-4 w-4" />
            <span>Webhooks API</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/api/templates'))}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            <span>Templates API</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* SDKs */}
        <CommandGroup heading="SDKs">
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/sdks/nodejs'))}>
            <Code className="mr-2 h-4 w-4" />
            <span>Node.js SDK</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/sdks/python'))}>
            <Code className="mr-2 h-4 w-4" />
            <span>Python SDK</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/sdks/go'))}>
            <Code className="mr-2 h-4 w-4" />
            <span>Go SDK</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/sdks/php'))}>
            <Code className="mr-2 h-4 w-4" />
            <span>PHP SDK</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/sdks/ruby'))}>
            <Code className="mr-2 h-4 w-4" />
            <span>Ruby SDK</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Guides */}
        <CommandGroup heading="Guides">
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/guides/domain-verification'))}>
            <Globe className="mr-2 h-4 w-4" />
            <span>Domain Verification</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/guides/sending-emails'))}>
            <Send className="mr-2 h-4 w-4" />
            <span>Sending Emails</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/guides/templates'))}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            <span>Using Templates</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/guides/audiences'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Audiences & Contacts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/guides/webhooks'))}>
            <Webhook className="mr-2 h-4 w-4" />
            <span>Webhook Events</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/guides/deliverability'))}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Deliverability</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Resources */}
        <CommandGroup heading="Resources">
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/rate-limits'))}>
            <Gauge className="mr-2 h-4 w-4" />
            <span>Rate Limits</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/errors'))}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Error Codes</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs/changelog'))}>
            <History className="mr-2 h-4 w-4" />
            <span>Changelog</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Help & Account */}
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(handleSignOut)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
            <div className="ml-auto flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>Q</Kbd>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
