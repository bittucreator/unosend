import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'

// Verify unsubscribe token
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  try {
    // Token format: base64(contactId:hash)
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [contactId] = decoded.split(':')

    if (!contactId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Get contact
    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .select('id, email, subscribed')
      .eq('id', contactId)
      .single()

    if (error || !contact) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    if (!contact.subscribed) {
      return NextResponse.json({ error: 'Already unsubscribed', email: contact.email }, { status: 400 })
    }

    return NextResponse.json({ email: contact.email })
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
}

// Process unsubscribe
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [contactId, hash] = decoded.split(':')

    if (!contactId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Verify hash
    const expectedHash = crypto
      .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET || 'unosend-unsubscribe-secret')
      .update(contactId)
      .digest('hex')
      .substring(0, 16)

    if (hash !== expectedHash) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Update contact
    const { error } = await supabaseAdmin
      .from('contacts')
      .update({ 
        subscribed: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('id', contactId)

    if (error) {
      console.error('Unsubscribe error:', error)
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Helper function to generate unsubscribe token
export function generateUnsubscribeToken(contactId: string): string {
  const hash = crypto
    .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET || 'unosend-unsubscribe-secret')
    .update(contactId)
    .digest('hex')
    .substring(0, 16)
  
  return Buffer.from(`${contactId}:${hash}`).toString('base64')
}
