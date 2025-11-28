import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Bug, Wrench, Plus } from 'lucide-react'

interface ChangelogEntry {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'breaking'
    description: string
  }[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.5.0',
    date: 'March 20, 2024',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Added batch email endpoint for sending multiple emails in one request' },
      { type: 'feature', description: 'New template variables for dynamic content rendering' },
      { type: 'improvement', description: 'Improved webhook delivery reliability with automatic retries' },
      { type: 'fix', description: 'Fixed issue with special characters in email subject lines' },
    ]
  },
  {
    version: '1.4.0',
    date: 'March 5, 2024',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Added audience segmentation for targeted broadcasts' },
      { type: 'feature', description: 'New Python SDK with async support' },
      { type: 'improvement', description: 'Reduced API latency by 40%' },
      { type: 'fix', description: 'Fixed DKIM signature verification for some domains' },
    ]
  },
  {
    version: '1.3.0',
    date: 'February 20, 2024',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Introduced email templates with variable substitution' },
      { type: 'feature', description: 'Added contact management endpoints' },
      { type: 'improvement', description: 'Enhanced rate limit headers with more detailed information' },
      { type: 'fix', description: 'Fixed timezone handling in scheduled emails' },
    ]
  },
  {
    version: '1.2.0',
    date: 'February 5, 2024',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Added webhook support for email events' },
      { type: 'feature', description: 'New Go SDK available' },
      { type: 'improvement', description: 'Improved email validation with better error messages' },
      { type: 'breaking', description: 'Changed API key format from "api_" prefix to "un_" prefix' },
    ]
  },
  {
    version: '1.1.0',
    date: 'January 20, 2024',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Domain verification with automatic DNS record detection' },
      { type: 'feature', description: 'Email scheduling for future delivery' },
      { type: 'improvement', description: 'Added support for CC and BCC recipients' },
      { type: 'fix', description: 'Fixed HTML encoding issues in email body' },
    ]
  },
  {
    version: '1.0.0',
    date: 'January 1, 2024',
    type: 'major',
    changes: [
      { type: 'feature', description: 'Initial release of Unosend API' },
      { type: 'feature', description: 'Send transactional emails via REST API' },
      { type: 'feature', description: 'Node.js SDK available' },
      { type: 'feature', description: 'Dashboard for API key management' },
    ]
  },
]

function getChangeIcon(type: string) {
  switch (type) {
    case 'feature':
      return <Plus className="w-3.5 h-3.5" />
    case 'improvement':
      return <Zap className="w-3.5 h-3.5" />
    case 'fix':
      return <Bug className="w-3.5 h-3.5" />
    case 'breaking':
      return <Wrench className="w-3.5 h-3.5" />
    default:
      return <Sparkles className="w-3.5 h-3.5" />
  }
}

function getChangeBadge(type: string) {
  switch (type) {
    case 'feature':
      return <Badge className="text-[10px] bg-green-100 text-green-700 border-0 hover:bg-green-100">New</Badge>
    case 'improvement':
      return <Badge className="text-[10px] bg-blue-100 text-blue-700 border-0 hover:bg-blue-100">Improved</Badge>
    case 'fix':
      return <Badge className="text-[10px] bg-amber-100 text-amber-700 border-0 hover:bg-amber-100">Fixed</Badge>
    case 'breaking':
      return <Badge className="text-[10px] bg-red-100 text-red-700 border-0 hover:bg-red-100">Breaking</Badge>
    default:
      return null
  }
}

function getVersionBadge(type: string) {
  switch (type) {
    case 'major':
      return <Badge className="text-[11px] bg-purple-100 text-purple-700 border-0 hover:bg-purple-100">Major Release</Badge>
    case 'minor':
      return <Badge className="text-[11px] bg-blue-100 text-blue-700 border-0 hover:bg-blue-100">Minor Release</Badge>
    case 'patch':
      return <Badge className="text-[11px] bg-stone-100 text-stone-700 border-0 hover:bg-stone-100">Patch</Badge>
    default:
      return null
  }
}

export default function ChangelogPage() {
  return (
    <div className="py-10 px-6 lg:px-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4 text-[11px] bg-purple-50 text-purple-700 border-0">
          Reference
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Changelog</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          Track all updates, new features, and improvements to the Unosend API.
        </p>
      </div>

      {/* Subscribe */}
      <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 border border-stone-200/60 rounded-xl p-5 mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-[14px] font-semibold text-stone-900">Stay Updated</span>
        </div>
        <p className="text-[13px] text-muted-foreground mb-3">
          Get notified about new features and updates. Follow us on Twitter or subscribe to our newsletter.
        </p>
        <div className="flex gap-2">
          <a 
            href="https://twitter.com/unosend" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 h-8 text-[12px] font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Follow @unosend
          </a>
          <a 
            href="/newsletter" 
            className="inline-flex items-center px-3 h-8 text-[12px] font-medium bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Subscribe to Newsletter
          </a>
        </div>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-8">
        {changelog.map((entry, index) => (
          <div key={entry.version} className="relative">
            {/* Timeline line */}
            {index !== changelog.length - 1 && (
              <div className="absolute left-[15px] top-10 bottom-0 w-px bg-stone-200" />
            )}
            
            <div className="flex gap-4">
              {/* Timeline dot */}
              <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center shrink-0 z-10">
                <div className="w-2 h-2 rounded-full bg-stone-400" />
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-stone-900">v{entry.version}</h2>
                  {getVersionBadge(entry.type)}
                </div>
                <p className="text-[13px] text-muted-foreground mb-4">{entry.date}</p>
                
                <div className="bg-white border border-stone-200/60 rounded-xl divide-y divide-stone-100">
                  {entry.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start gap-3 p-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        change.type === 'feature' ? 'bg-green-100 text-green-600' :
                        change.type === 'improvement' ? 'bg-blue-100 text-blue-600' :
                        change.type === 'fix' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {getChangeIcon(change.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getChangeBadge(change.type)}
                        </div>
                        <p className="text-[13px] text-stone-700">{change.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <button className="inline-flex items-center px-4 h-9 text-[13px] font-medium bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors">
          Load Older Versions
        </button>
      </div>
    </div>
  )
}
