'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ExportButtonProps {
  type: 'contacts' | 'emails'
  audienceId?: string
  status?: string
  startDate?: string
  endDate?: string
}

export function ExportButton({ type, audienceId, status, startDate, endDate }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async (format: 'csv' | 'json') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('format', format)
      
      if (type === 'contacts' && audienceId) {
        params.set('audience_id', audienceId)
      }
      if (type === 'emails') {
        if (status) params.set('status', status)
        if (startDate) params.set('start_date', startDate)
        if (endDate) params.set('end_date', endDate)
      }

      const endpoint = type === 'contacts' 
        ? '/api/v1/contacts/export' 
        : '/api/v1/emails/export'

      const response = await fetch(`${endpoint}?${params.toString()}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Export failed')
      }

      if (format === 'json') {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        downloadBlob(blob, `${type}-${new Date().toISOString().split('T')[0]}.json`)
      } else {
        const blob = await response.blob()
        downloadBlob(blob, `${type}-${new Date().toISOString().split('T')[0]}.csv`)
      }

      toast.success(`${type === 'contacts' ? 'Contacts' : 'Emails'} exported successfully`)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-[13px]" disabled={loading}>
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-1.5" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
