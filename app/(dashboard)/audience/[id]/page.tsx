import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  ArrowLeft, 
  Mail, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Radio
} from 'lucide-react'
import { AddContactButton } from '@/components/dashboard/add-contact-button'
import { ImportContactsButton } from '@/components/dashboard/import-contacts-button'
import { ExportButton } from '@/components/dashboard/export-button'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AudienceDetailPage({ params }: PageProps) {
  const { id } = await params
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

  if (!membership) {
    redirect('/audience')
  }

  // Fetch audience
  const { data: audience, error: audienceError } = await supabase
    .from('audiences')
    .select('id, name, description, created_at')
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (audienceError || !audience) {
    redirect('/audience')
  }

  // Fetch contacts in this audience
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, email, first_name, last_name, subscribed, created_at')
    .eq('audience_id', id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Get all audiences for the add contact button
  const { data: allAudiences } = await supabase
    .from('audiences')
    .select('id, name')
    .eq('organization_id', membership.organization_id)

  const formattedContacts = (contacts || []).map(c => ({
    ...c,
    created_at: new Date(c.created_at).toLocaleDateString()
  }))

  // Stats
  const { count: totalCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('audience_id', id)

  const { count: subscribedCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('audience_id', id)
    .eq('subscribed', true)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/audience">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{audience.name}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {audience.description || 'Manage contacts in this audience'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="contacts" audienceId={id} />
          <ImportContactsButton audiences={allAudiences || []} defaultAudienceId={id} />
          <AddContactButton 
            organizationId={membership.organization_id} 
            audiences={allAudiences || []} 
            defaultAudienceId={id}
          />
          <Button asChild size="sm" className="h-8 text-[13px]">
            <Link href={`/broadcasts/new?audience=${id}`}>
              <Radio className="w-3.5 h-3.5 mr-1.5" />
              Send Broadcast
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="border border-stone-200 rounded-xl bg-white p-4 sm:p-5">
          <p className="text-[13px] text-muted-foreground">Total Contacts</p>
          <p className="text-2xl font-semibold mt-1">{(totalCount || 0).toLocaleString()}</p>
        </div>
        <div className="border border-stone-200 rounded-xl bg-white p-4 sm:p-5">
          <p className="text-[13px] text-muted-foreground">Subscribed</p>
          <p className="text-2xl font-semibold mt-1">{(subscribedCount || 0).toLocaleString()}</p>
        </div>
        <div className="border border-stone-200 rounded-xl bg-white p-4 sm:p-5">
          <p className="text-[13px] text-muted-foreground">Unsubscribed</p>
          <p className="text-2xl font-semibold mt-1">{((totalCount || 0) - (subscribedCount || 0)).toLocaleString()}</p>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Users className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Contacts</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formattedContacts.length} contact{formattedContacts.length !== 1 ? 's' : ''} shown
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          {formattedContacts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-stone-400" />
              </div>
              <p className="font-medium text-[15px] mb-1">No contacts yet</p>
              <p className="text-[13px] text-muted-foreground mb-5">Add contacts to this audience</p>
              <div className="flex items-center justify-center gap-2">
                <ImportContactsButton audiences={allAudiences || []} defaultAudienceId={id} />
                <AddContactButton 
                  organizationId={membership.organization_id} 
                  audiences={allAudiences || []}
                  defaultAudienceId={id}
                />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="border-stone-100">
                    <TableHead className="text-[13px] font-medium text-muted-foreground">Email</TableHead>
                    <TableHead className="hidden sm:table-cell text-[13px] font-medium text-muted-foreground">Name</TableHead>
                    <TableHead className="text-[13px] font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="hidden sm:table-cell text-[13px] font-medium text-muted-foreground">Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formattedContacts.map((contact) => (
                    <TableRow key={contact.id} className="border-stone-100">
                      <TableCell className="font-medium text-[13px]">
                        {contact.email}
                        <span className="block sm:hidden text-xs text-muted-foreground mt-0.5">
                          {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[13px] hidden sm:table-cell">
                        {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '—'}
                      </TableCell>
                      <TableCell>
                        {contact.subscribed ? (
                          <Badge variant="secondary" className="text-[11px] bg-green-50 text-green-700 border-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Subscribed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[11px] bg-stone-100 text-stone-600 border-0">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unsubscribed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[13px] hidden sm:table-cell">
                        {contact.created_at}
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
