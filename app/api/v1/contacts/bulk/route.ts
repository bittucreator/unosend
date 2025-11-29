import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateApiKey, apiError, apiSuccess } from '@/lib/api-middleware'
import { z } from 'zod'

const bulkOperationSchema = z.object({
  contact_ids: z.array(z.string().uuid()).min(1, 'At least one contact ID required'),
  operation: z.enum(['delete', 'subscribe', 'unsubscribe', 'move']),
  audience_id: z.string().uuid().optional(), // Required for 'move' operation
})

// POST - Perform bulk operations on contacts
export async function POST(request: NextRequest) {
  const context = await validateApiKey(request)
  if (!context) {
    return apiError('Invalid or missing API key', 401)
  }

  try {
    const body = await request.json()
    
    const validationResult = bulkOperationSchema.safeParse(body)
    if (!validationResult.success) {
      return apiError(validationResult.error.issues[0].message, 400)
    }

    const { contact_ids, operation, audience_id } = validationResult.data

    // Verify all contacts belong to this organization
    const { data: contacts, error: verifyError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('organization_id', context.organizationId)
      .in('id', contact_ids)

    if (verifyError) {
      return apiError('Failed to verify contacts', 500)
    }

    const validIds = contacts?.map(c => c.id) || []
    const invalidCount = contact_ids.length - validIds.length

    if (validIds.length === 0) {
      return apiError('No valid contacts found', 404)
    }

    let affectedCount = 0

    switch (operation) {
      case 'delete': {
        const { error } = await supabaseAdmin
          .from('contacts')
          .delete()
          .in('id', validIds)

        if (error) {
          return apiError('Failed to delete contacts', 500)
        }
        affectedCount = validIds.length
        break
      }

      case 'subscribe': {
        const { error } = await supabaseAdmin
          .from('contacts')
          .update({ subscribed: true, updated_at: new Date().toISOString() })
          .in('id', validIds)

        if (error) {
          return apiError('Failed to subscribe contacts', 500)
        }
        affectedCount = validIds.length
        break
      }

      case 'unsubscribe': {
        const { error } = await supabaseAdmin
          .from('contacts')
          .update({ subscribed: false, updated_at: new Date().toISOString() })
          .in('id', validIds)

        if (error) {
          return apiError('Failed to unsubscribe contacts', 500)
        }
        affectedCount = validIds.length
        break
      }

      case 'move': {
        if (!audience_id) {
          return apiError('audience_id required for move operation', 400)
        }

        // Verify audience exists and belongs to organization
        const { data: audience, error: audienceError } = await supabaseAdmin
          .from('audiences')
          .select('id')
          .eq('id', audience_id)
          .eq('organization_id', context.organizationId)
          .single()

        if (audienceError || !audience) {
          return apiError('Audience not found', 404)
        }

        const { error } = await supabaseAdmin
          .from('contacts')
          .update({ audience_id, updated_at: new Date().toISOString() })
          .in('id', validIds)

        if (error) {
          return apiError('Failed to move contacts', 500)
        }
        affectedCount = validIds.length
        break
      }
    }

    return apiSuccess({
      operation,
      affected: affectedCount,
      skipped: invalidCount,
      message: `Successfully ${operation === 'delete' ? 'deleted' : operation === 'subscribe' ? 'subscribed' : operation === 'unsubscribe' ? 'unsubscribed' : 'moved'} ${affectedCount} contact(s)`,
    })
  } catch {
    return apiError('Invalid request body', 400)
  }
}
