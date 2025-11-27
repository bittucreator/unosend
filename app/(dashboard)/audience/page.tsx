import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users, Upload, UserPlus, Mail } from 'lucide-react'

export default async function AudiencePage() {
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
    redirect('/login')
  }

  // Fetch audiences from database
  const { data: audiences } = await supabase
    .from('audiences')
    .select('id, name, created_at')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audience</h1>
          <p className="text-muted-foreground mt-1">Manage your contacts and audiences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Audience
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Contacts</CardDescription>
            <CardTitle className="text-3xl">{(totalContacts || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Audiences</CardDescription>
            <CardTitle className="text-3xl">{formattedAudiences.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Subscribed</CardDescription>
            <CardTitle className="text-3xl">{(subscribedCount || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audiences</CardTitle>
          <CardDescription>Group your contacts into audiences for targeted broadcasts</CardDescription>
        </CardHeader>
        <CardContent>
          {formattedAudiences.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No audiences yet</p>
              <p className="text-muted-foreground text-sm mb-4">Create an audience to organize your contacts</p>
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Contacts
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Audience
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedAudiences.map((audience) => (
                  <TableRow key={audience.id}>
                    <TableCell className="font-medium">{audience.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <UserPlus className="w-3 h-3 mr-1" />
                        {audience.contacts.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{audience.created_at}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Mail className="w-4 h-4 mr-1" />
                        Send Broadcast
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
