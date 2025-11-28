import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
import { Users, UserPlus, Mail, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react'
import { CreateAudienceButton } from '@/components/dashboard/create-audience-button'
import { AddContactButton } from '@/components/dashboard/add-contact-button'
import { ImportContactsButton } from '@/components/dashboard/import-contacts-button'
import { ExportButton } from '@/components/dashboard/export-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function AudiencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  let { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  // If no organization exists, create one
  if (!membership) {
    try {
      const slug = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + user.id.substring(0, 8)
      
      // Create organization using admin client
      const { data: newOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
          name: 'My Organization',
          slug,
          owner_id: user.id,
        })
        .select('id')
        .single()
      
      if (!orgError && newOrg) {
        // Add user as owner
        await supabaseAdmin
          .from('organization_members')
          .insert({
            organization_id: newOrg.id,
            user_id: user.id,
            role: 'owner',
          })
        
        membership = { organization_id: newOrg.id }
      }
    } catch (e) {
      console.error('Failed to create organization:', e)
    }
  }

  const organizationId = membership?.organization_id

  // Fetch audiences from database
  const { data: audiences } = organizationId ? await supabase
    .from('audiences')
    .select('id, name, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false }) : { data: [] }

  // Get contact counts for each audience
  const audienceIds = (audiences || []).map(a => a.id)
  const { data: contactCounts } = audienceIds.length > 0 
    ? await supabase
        .from('contacts')
        .select('audience_id')
        .in('audience_id', audienceIds)
    : { data: [] }

  // Count contacts per audience
  const countMap: Record<string, number> = {}
  ;(contactCounts || []).forEach(c => {
    countMap[c.audience_id] = (countMap[c.audience_id] || 0) + 1
  })

  const formattedAudiences = (audiences || []).map(a => ({
    ...a,
    contacts: countMap[a.id] || 0,
    created_at: new Date(a.created_at).toLocaleDateString()
  }))

  // Get total contacts and subscribed count
  const { count: totalContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .in('audience_id', audienceIds.length > 0 ? audienceIds : ['none'])

  const { count: subscribedCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .in('audience_id', audienceIds.length > 0 ? audienceIds : ['none'])
    .eq('subscribed', true)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Audience</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Manage your contacts and audiences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="contacts" />
          <ImportContactsButton audiences={formattedAudiences} />
          <AddContactButton organizationId={organizationId || ''} audiences={formattedAudiences} />
          <CreateAudienceButton organizationId={organizationId || ''} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="border border-stone-200 rounded-xl bg-white p-4 sm:p-5">
          <p className="text-[13px] text-muted-foreground">Total Contacts</p>
          <p className="text-2xl font-semibold mt-1">{(totalContacts || 0).toLocaleString()}</p>
        </div>
        <div className="border border-stone-200 rounded-xl bg-white p-4 sm:p-5">
          <p className="text-[13px] text-muted-foreground">Audiences</p>
          <p className="text-2xl font-semibold mt-1">{formattedAudiences.length}</p>
        </div>
        <div className="border border-stone-200 rounded-xl bg-white p-4 sm:p-5">
          <p className="text-[13px] text-muted-foreground">Subscribed</p>
          <p className="text-2xl font-semibold mt-1">{(subscribedCount || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Audiences Section */}
      <div className="border border-stone-200 rounded-xl bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Users className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">All Audiences</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formattedAudiences.length} audience{formattedAudiences.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          {formattedAudiences.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-stone-400" />
              </div>
              <p className="font-medium text-[15px] mb-1">No audiences yet</p>
              <p className="text-[13px] text-muted-foreground mb-5">Create an audience to organize your contacts</p>
              <div className="flex items-center justify-center gap-2">
                <AddContactButton organizationId={organizationId || ''} audiences={formattedAudiences} />
                <CreateAudienceButton organizationId={organizationId || ''} />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="border-stone-100">
                    <TableHead className="text-[13px] font-medium text-muted-foreground">Name</TableHead>
                    <TableHead className="text-[13px] font-medium text-muted-foreground">Contacts</TableHead>
                    <TableHead className="text-[13px] font-medium text-muted-foreground hidden sm:table-cell">Created</TableHead>
                    <TableHead className="text-right text-[13px] font-medium text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formattedAudiences.map((audience) => (
                    <TableRow key={audience.id} className="border-stone-100">
                      <TableCell className="font-medium text-[13px]">{audience.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[11px] bg-stone-100 text-stone-600 border-0">
                          <UserPlus className="w-3 h-3 mr-1" />
                          {audience.contacts.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[13px] hidden sm:table-cell">{audience.created_at}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[13px]">
                          <Mail className="w-3.5 h-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Send Broadcast</span>
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
