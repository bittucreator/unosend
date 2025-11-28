'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { toast } from 'sonner'

interface ImportContactsButtonProps {
  audiences: Array<{ id: string; name: string }>
}

interface ImportResult {
  imported: number
  duplicates: number
  errors: number
  total: number
  errorDetails?: Array<{ row: number; error: string }>
}

export function ImportContactsButton({ audiences }: ImportContactsButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audienceId, setAudienceId] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      setSelectedFile(file)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !audienceId) {
      toast.error('Please select a file and audience')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('audience_id', audienceId)

      const response = await fetch('/api/v1/contacts/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data.data)
      
      if (data.data.imported > 0) {
        toast.success(`Successfully imported ${data.data.imported} contacts`)
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedFile(null)
    setAudienceId('')
    setResult(null)
  }

  const downloadTemplate = () => {
    const csvContent = 'email,first_name,last_name\njohn@example.com,John,Doe\njane@example.com,Jane,Smith'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-[13px]">
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import contacts into an audience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Audience Selection */}
          <div className="space-y-2">
            <Label>Select Audience</Label>
            <Select value={audienceId} onValueChange={setAudienceId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an audience" />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((audience) => (
                  <SelectItem key={audience.id} value={audience.id}>
                    {audience.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-lg p-6 text-center cursor-pointer hover:border-stone-300 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-stone-600">
                  <FileText className="w-5 h-5" />
                  <span className="text-[13px] font-medium">{selectedFile.name}</span>
                  <span className="text-[12px] text-muted-foreground">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-[13px] text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    CSV file with email, first_name, last_name columns
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Template Download */}
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadTemplate}
            className="text-[12px] h-7"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download template CSV
          </Button>

          {/* Import Result */}
          {result && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                {result.errors === 0 && result.imported > 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-[13px] font-medium">Import Complete</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Imported:</span>
                  <span className="font-medium text-green-600">{result.imported}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total rows:</span>
                  <span>{result.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duplicates:</span>
                  <span className="text-amber-600">{result.duplicates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Errors:</span>
                  <span className="text-red-600">{result.errors}</span>
                </div>
              </div>
              {result.errorDetails && result.errorDetails.length > 0 && (
                <div className="mt-2 pt-2 border-t border-stone-200">
                  <p className="text-[11px] text-muted-foreground mb-1">Errors:</p>
                  <ul className="text-[11px] text-red-600 space-y-0.5">
                    {result.errorDetails.map((err, i) => (
                      <li key={i}>Row {err.row}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button 
              onClick={handleImport} 
              disabled={loading || !selectedFile || !audienceId}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Import Contacts
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
