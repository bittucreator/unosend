import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const createBroadcastSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  from: z.string().min(1, 'From email is required'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().optional(),
  text: z.string().optional(),
  audience_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  try {
    const body = await request.json()
    
    const validationResult = createBroadcastSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { name, from, subject, html, text, audience_id, template_id, scheduled_at } = validationResult.data

    // Parse from email
    const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/)
    const fromEmail = fromMatch ? fromMatch[2] : from
    const fromName = fromMatch ? fromMatch[1].trim() : null

    // Get recipient count if audience specified
    let totalRecipients = 0
    if (audience_id) {
      const { count } = await supabaseAdmin
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('audience_id', audience_id)
        .eq('subscribed', true)

      totalRecipients = count || 0
    }

    const status = scheduled_at ? 'scheduled' : 'draft'

    const { data: broadcast, error } = await supabaseAdmin
      .from('broadcasts')
      .insert({
        organization_id: context.organizationId,
        name,
        from_email: fromEmail,
        from_name: fromName,
        subject,
        html_content: html,
        text_content: text,
        audience_id,
        template_id,
        scheduled_at,
        status,
        total_recipients: totalRecipients,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create broadcast:', error)
      return apiError('Failed to create broadcast', 500)
    }

    return apiSuccess({
      id: broadcast.id,
      name: broadcast.name,
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      subject: broadcast.subject,
      status: broadcast.status,
      audience_id: broadcast.audience_id,
      total_recipients: broadcast.total_recipients,
      scheduled_at: broadcast.scheduled_at,
      created_at: broadcast.created_at,
    }, 201)
  } catch {
    return apiError('Invalid request body', 400)
  }
}

export async function GET(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  const { data: broadcasts, error } = await supabaseAdmin
    .from('broadcasts')
    .select(`
      id,
      name,
      from_email,
      from_name,
      subject,
      status,
      audience_id,
      total_recipients,
      sent_count,
      scheduled_at,
      sent_at,
      created_at
    `)
    .eq('organization_id', context.organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    return apiError('Failed to fetch broadcasts', 500)
  }

  return apiSuccess({
    data: broadcasts.map(b => ({
      id: b.id,
      name: b.name,
      from: b.from_name ? `${b.from_name} <${b.from_email}>` : b.from_email,
      subject: b.subject,
      status: b.status,
      audience_id: b.audience_id,
      total_recipients: b.total_recipients,
      sent_count: b.sent_count,
      scheduled_at: b.scheduled_at,
      sent_at: b.sent_at,
      created_at: b.created_at,
    })),
  })
}
