'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollText, CheckCircle, XCircle, Send, Clock, Search, Calendar, Globe, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import Link from 'next/link'

interface Email {
  id: string
  from_email: string
  to_emails: string[]
  subject: string
  status: string
  created_at: string
  sent_at: string | null
  scheduled_for: string | null
  email_events: Array<{ event_type: string }>
}

interface ApiLog {
  id: string
  method: string
  endpoint: string
  path: string
  status_code: number
  user_agent: string | null
  duration_ms: number | null
  created_at: string
}

interface LogsClientProps {
  initialEmails: Email[]
  organizationId: string
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  queued: { icon: Clock, color: 'bg-stone-100 text-stone-700', label: 'Queued' },
  scheduled: { icon: Calendar, color: 'bg-purple-50 text-purple-700', label: 'Scheduled' },
  sent: { icon: Send, color: 'bg-blue-50 text-blue-700', label: 'Sent' },
  delivered: { icon: CheckCircle, color: 'bg-green-50 text-green-700', label: 'Delivered' },
  bounced: { icon: XCircle, color: 'bg-red-50 text-red-700', label: 'Bounced' },
  failed: { icon: XCircle, color: 'bg-red-50 text-red-700', label: 'Failed' },
  cancelled: { icon: XCircle, color: 'bg-stone-100 text-stone-500', label: 'Cancelled' },
}

const httpStatusConfig: Record<string, { color: string; label: string }> = {
  '2xx': { color: 'bg-green-50 text-green-700', label: 'Success' },
  '4xx': { color: 'bg-yellow-50 text-yellow-700', label: 'Client Error' },
  '5xx': { color: 'bg-red-50 text-red-700', label: 'Server Error' },
}

function getStatusCategory(code: number): string {
  if (code >= 200 && code < 300) return '2xx'
  if (code >= 400 && code < 500) return '4xx'
  if (code >= 500) return '5xx'
  return '2xx'
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-50 text-blue-700',
  POST: 'bg-green-50 text-green-700',
  PUT: 'bg-yellow-50 text-yellow-700',
  PATCH: 'bg-orange-50 text-orange-700',
  DELETE: 'bg-red-50 text-red-700',
}

export function LogsClient({ initialEmails, organizationId }: LogsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'email')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [method, setMethod] = useState(searchParams.get('method') || 'all')
  const [timeRange, setTimeRange] = useState(searchParams.get('range') || '7d')
  const [emails, setEmails] = useState(initialEmails)
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (status !== 'all') params.set('status', status)
      params.set('range', timeRange)

      const response = await fetch(`/api/dashboard/logs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails || [])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, timeRange])

  const fetchApiLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (status !== 'all') params.set('status', status)
      if (method !== 'all') params.set('method', method)
      params.set('range', timeRange)

      const response = await fetch(`/api/dashboard/api-logs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setApiLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch API logs:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, method, timeRange])

  // Fetch when filters change
  useEffect(() => {
    if (activeTab === 'email') {
      fetchEmails()
    } else {
      fetchApiLogs()
    }
  }, [activeTab, fetchEmails, fetchApiLogs])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeTab !== 'email') params.set('tab', activeTab)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (status !== 'all') params.set('status', status)
    if (method !== 'all' && activeTab === 'api') params.set('method', method)
    if (timeRange !== '7d') params.set('range', timeRange)
    
    const queryString = params.toString()
    startTransition(() => {
      router.replace(`/logs${queryString ? `?${queryString}` : ''}`, { scroll: false })
    })
  }, [activeTab, debouncedSearch, status, method, timeRange, router])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Logs</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Search and filter your email and API activity
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-stone-100/50 p-1">
          <TabsTrigger value="email" className="text-[13px] data-[state=active]:bg-white">
            <Mail className="w-4 h-4 mr-2" />
            Email Logs
          </TabsTrigger>
          <TabsTrigger value="api" className="text-[13px] data-[state=active]:bg-white">
            <Globe className="w-4 h-4 mr-2" />
            API Logs
          </TabsTrigger>
        </TabsList>

        {/* Email Logs Tab */}
        <TabsContent value="email" className="space-y-6 mt-0">
          {/* Filters */}
          <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input 
                  placeholder="Search by email or subject..." 
                  className="pl-9 h-9 text-[13px] border-stone-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-40 h-9 text-[13px] border-stone-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[13px]">All Status</SelectItem>
                  <SelectItem value="scheduled" className="text-[13px]">Scheduled</SelectItem>
                  <SelectItem value="queued" className="text-[13px]">Queued</SelectItem>
                  <SelectItem value="sent" className="text-[13px]">Sent</SelectItem>
                  <SelectItem value="delivered" className="text-[13px]">Delivered</SelectItem>
                  <SelectItem value="bounced" className="text-[13px]">Bounced</SelectItem>
                  <SelectItem value="failed" className="text-[13px]">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-40 h-9 text-[13px] border-stone-200">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h" className="text-[13px]">Last hour</SelectItem>
                  <SelectItem value="24h" className="text-[13px]">Last 24 hours</SelectItem>
                  <SelectItem value="7d" className="text-[13px]">Last 7 days</SelectItem>
                  <SelectItem value="30d" className="text-[13px]">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100">
              <h2 className="font-semibold text-[15px]">Email Activity Logs</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Real-time email activity and events
                {loading && <span className="ml-2 text-xs">(Loading...)</span>}
              </p>
            </div>
            
            {emails.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <ScrollText className="w-6 h-6 text-stone-400" />
                </div>
                <p className="font-medium text-[14px] mb-1">No logs found</p>
                <p className="text-muted-foreground text-[13px]">
                  {search || status !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Email activity will appear here once you start sending'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-stone-50 hover:bg-stone-50">
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Time</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">To</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Subject</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Events</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((email) => {
                      const statusInfo = statusConfig[email.status] || statusConfig.queued
                      const StatusIcon = statusInfo.icon
                      const events = email.email_events || []

                      return (
                        <TableRow 
                          key={email.id} 
                          className="hover:bg-stone-50 cursor-pointer"
                          onClick={() => router.push(`/emails/${email.id}`)}
                        >
                          <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap">
                            {email.status === 'scheduled' && email.scheduled_for
                              ? `Scheduled for ${formatDistanceToNow(new Date(email.scheduled_for), { addSuffix: false })}`
                              : formatDistanceToNow(new Date(email.created_at), { addSuffix: true })
                            }
                          </TableCell>
                          <TableCell className="font-mono text-[12px]">
                            {email.to_emails[0]}
                            {email.to_emails.length > 1 && (
                              <span className="text-muted-foreground"> +{email.to_emails.length - 1}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-[13px] max-w-xs truncate">{email.subject}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${statusInfo.color} text-[11px] border-0`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {events.slice(0, 3).map((event, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] border-stone-200">
                                  {event.event_type}
                                </Badge>
                              ))}
                              {events.length > 3 && (
                                <Badge variant="outline" className="text-[10px] border-stone-200">
                                  +{events.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* API Logs Tab */}
        <TabsContent value="api" className="space-y-6 mt-0">
          {/* Filters */}
          <div className="border border-stone-200/60 rounded-xl bg-white p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input 
                  placeholder="Search by endpoint..." 
                  className="pl-9 h-9 text-[13px] border-stone-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-full sm:w-32 h-9 text-[13px] border-stone-200">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[13px]">All Methods</SelectItem>
                  <SelectItem value="GET" className="text-[13px]">GET</SelectItem>
                  <SelectItem value="POST" className="text-[13px]">POST</SelectItem>
                  <SelectItem value="PUT" className="text-[13px]">PUT</SelectItem>
                  <SelectItem value="PATCH" className="text-[13px]">PATCH</SelectItem>
                  <SelectItem value="DELETE" className="text-[13px]">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-40 h-9 text-[13px] border-stone-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[13px]">All Status</SelectItem>
                  <SelectItem value="2xx" className="text-[13px]">2xx Success</SelectItem>
                  <SelectItem value="4xx" className="text-[13px]">4xx Client Error</SelectItem>
                  <SelectItem value="5xx" className="text-[13px]">5xx Server Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-40 h-9 text-[13px] border-stone-200">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h" className="text-[13px]">Last hour</SelectItem>
                  <SelectItem value="24h" className="text-[13px]">Last 24 hours</SelectItem>
                  <SelectItem value="7d" className="text-[13px]">Last 7 days</SelectItem>
                  <SelectItem value="30d" className="text-[13px]">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* API Logs Table */}
          <div className="border border-stone-200/60 rounded-xl bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100">
              <h2 className="font-semibold text-[15px]">API Request Logs</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                All API requests made to your endpoints
                {loading && <span className="ml-2 text-xs">(Loading...)</span>}
              </p>
            </div>
            
            {apiLogs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-stone-400" />
                </div>
                <p className="font-medium text-[14px] mb-1">No API logs found</p>
                <p className="text-muted-foreground text-[13px]">
                  {search || status !== 'all' || method !== 'all'
                    ? 'Try adjusting your filters' 
                    : 'API activity will appear here once you start making requests'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-stone-50 hover:bg-stone-50">
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Endpoint</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Method</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Duration</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiLogs.map((log) => {
                      const statusCategory = getStatusCategory(log.status_code)
                      const statusInfo = httpStatusConfig[statusCategory]

                      return (
                        <TableRow 
                          key={log.id} 
                          className="hover:bg-stone-50"
                        >
                          <TableCell>
                            <Link 
                              href={`/logs/${log.id}`}
                              className="font-mono text-[12px] text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {log.endpoint}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${statusInfo.color} text-[11px] border-0`}>
                              {log.status_code}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${methodColors[log.method] || 'bg-stone-100 text-stone-700'} text-[11px] border-0`}>
                              {log.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">
                            {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
