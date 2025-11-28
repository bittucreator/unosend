import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
