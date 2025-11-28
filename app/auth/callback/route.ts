import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/emails'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user has an organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', data.user.id)
        .single()
      
      // If no organization, create one automatically
      if (!membership) {
        const emailPrefix = data.user.email?.split('@')[0] || 'user'
        const workspaceName = emailPrefix
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()) + "'s Workspace"
        
        const slug = emailPrefix
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .substring(0, 30) + '-' + data.user.id.substring(0, 8)
        
        // Create organization
        const { data: org } = await supabase
          .from('organizations')
          .insert({
            name: workspaceName,
            slug: slug,
            owner_id: data.user.id,
          })
          .select('id')
          .single()
        
        if (org) {
          // Add user as owner
          await supabase
            .from('organization_members')
            .insert({
              organization_id: org.id,
              user_id: data.user.id,
              role: 'owner',
            })
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
