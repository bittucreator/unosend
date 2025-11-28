import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Pencil, Plus, ExternalLink } from 'lucide-react'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  const organizationId = membership?.organization_id

  // Fetch templates from database
  const { data: templates } = organizationId ? await supabase
    .from('templates')
    .select('id, name, subject, updated_at')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false }) : { data: [] }

  const formattedTemplates = (templates || []).map(t => ({
    ...t,
    updated_at: t.updated_at ? new Date(t.updated_at).toLocaleDateString() : 'Never'
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Templates</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Build reusable email templates
          </p>
        </div>
        <Button asChild size="sm" className="h-8 text-[13px]">
          <Link href="/templates/new">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Template
          </Link>
        </Button>
      </div>

      {/* Templates Section */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <FileText className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">All Templates</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formattedTemplates.length} template{formattedTemplates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          {formattedTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-stone-400" />
              </div>
              <p className="font-medium text-[15px] mb-1">No templates yet</p>
              <p className="text-[13px] text-muted-foreground mb-5">Create your first template to build reusable emails</p>
              <Button variant="outline" size="sm" className="border-stone-200" asChild>
                <a href="https://docs.unosend.co" target="_blank" rel="noopener noreferrer">
                  Documentation <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="border-stone-100">
                    <TableHead className="text-[13px] font-medium text-muted-foreground">Name</TableHead>
                    <TableHead className="hidden sm:table-cell text-[13px] font-medium text-muted-foreground">Subject</TableHead>
                    <TableHead className="hidden sm:table-cell text-[13px] font-medium text-muted-foreground">Updated</TableHead>
                    <TableHead className="text-right text-[13px] font-medium text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formattedTemplates.map((template) => (
                    <TableRow key={template.id} className="border-stone-100">
                      <TableCell className="font-medium text-[13px]">
                        {template.name}
                        <span className="block sm:hidden text-xs text-muted-foreground mt-0.5 truncate">
                          {template.subject}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[13px] hidden sm:table-cell">{template.subject}</TableCell>
                      <TableCell className="text-muted-foreground text-[13px] hidden sm:table-cell">{template.updated_at}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[13px]" asChild>
                          <Link href={`/templates/${template.id}`}>
                            <Pencil className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
