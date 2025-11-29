'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, Globe, Key, Code } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

interface ApiLog {
  id: string
  method: string
  endpoint: string
  path: string
  status_code: number
  user_agent: string | null
  ip_address: string | null
  request_body: unknown
  response_body: unknown
  duration_ms: number | null
  created_at: string
  api_key_id: string | null
  api_keys: {
    name: string
    key_prefix: string
  }[] | null
}

interface ApiLogDetailClientProps {
  log: ApiLog
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-50 text-blue-700',
  POST: 'bg-green-50 text-green-700',
  PUT: 'bg-yellow-50 text-yellow-700',
  PATCH: 'bg-orange-50 text-orange-700',
  DELETE: 'bg-red-50 text-red-700',
}

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-green-50 text-green-700'
  if (code >= 400 && code < 500) return 'bg-yellow-50 text-yellow-700'
  if (code >= 500) return 'bg-red-50 text-red-700'
  return 'bg-stone-100 text-stone-700'
}

function JsonViewer({ data, title }: { data: unknown; title: string }) {
  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Code className="w-4 h-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-stone-50 rounded-lg p-4 text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Code className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-stone-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-stone-100 font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

export function ApiLogDetailClient({ log }: ApiLogDetailClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/logs?tab=api">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Log</h1>
            <Badge variant="secondary" className={`${methodColors[log.method] || 'bg-stone-100'} text-xs`}>
              {log.method}
            </Badge>
            <span className="font-mono text-lg">{log.endpoint}</span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">
            API request details and response
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Request Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Endpoint</p>
                <p className="font-mono text-sm mt-1">{log.endpoint}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Path</p>
                <p className="font-mono text-sm mt-1">{log.path}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Date</p>
                <p className="text-sm mt-1">
                  {format(new Date(log.created_at), 'PPpp')}
                  <span className="text-muted-foreground ml-1">
                    ({formatDistanceToNow(new Date(log.created_at), { addSuffix: true })})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Status</p>
                <Badge variant="secondary" className={`${getStatusColor(log.status_code)} text-xs mt-1`}>
                  {log.status_code}
                </Badge>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Method</p>
                <Badge variant="secondary" className={`${methodColors[log.method] || 'bg-stone-100'} text-xs mt-1`}>
                  {log.method}
                </Badge>
              </div>
              {log.duration_ms && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Duration</p>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.duration_ms}ms
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">User-Agent</p>
              <p className="font-mono text-xs mt-1 break-all">{log.user_agent || 'N/A'}</p>
            </div>
            {log.ip_address && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">IP Address</p>
                <p className="font-mono text-sm mt-1">{log.ip_address}</p>
              </div>
            )}
            {log.api_keys && log.api_keys[0] && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">API Key</p>
                <p className="text-sm mt-1">
                  {log.api_keys[0].name}
                  <span className="font-mono text-muted-foreground ml-2">
                    ({log.api_keys[0].key_prefix}...)
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request/Response Bodies */}
      <div className="grid gap-6 md:grid-cols-2">
        <JsonViewer data={log.request_body} title="Request Body" />
        <JsonViewer data={log.response_body} title="Response Body" />
      </div>
    </div>
  )
}
