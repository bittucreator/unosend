import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface CSVContact {
  email: string
  first_name?: string
  last_name?: string
  [key: string]: string | undefined
}

// Parse CSV content
function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split(/\r?\n/)
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim().replace(/\s+/g, '_'))
  
  // Parse data rows
  const rows = lines.slice(1)
    .filter(line => line.trim())
    .map(line => parseCSVLine(line))

  return { headers, rows }
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const audienceId = formData.get('audience_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!audienceId) {
      return NextResponse.json({ error: 'Audience ID required' }, { status: 400 })
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Verify audience belongs to organization
    const { data: audience } = await supabaseAdmin
      .from('audiences')
      .select('id')
      .eq('id', audienceId)
      .eq('organization_id', membership.organization_id)
      .single()

    if (!audience) {
      return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
    }

    // Read and parse CSV
    const content = await file.text()
    const { headers, rows } = parseCSV(content)

    // Find email column (required)
    const emailIndex = headers.findIndex(h => 
      h === 'email' || h === 'email_address' || h === 'e-mail'
    )

    if (emailIndex === -1) {
      return NextResponse.json({ 
        error: 'CSV must contain an "email" column' 
      }, { status: 400 })
    }

    // Find other common columns
    const firstNameIndex = headers.findIndex(h => 
      h === 'first_name' || h === 'firstname' || h === 'first'
    )
    const lastNameIndex = headers.findIndex(h => 
      h === 'last_name' || h === 'lastname' || h === 'last'
    )

    // Process contacts
    const contacts: CSVContact[] = []
    const errors: { row: number; error: string }[] = []
    const duplicates: string[] = []

    // Get existing emails in this audience
    const { data: existingContacts } = await supabaseAdmin
      .from('contacts')
      .select('email')
      .eq('audience_id', audienceId)

    const existingEmails = new Set(
      (existingContacts || []).map(c => c.email.toLowerCase())
    )

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const email = row[emailIndex]?.trim().toLowerCase()

      if (!email) {
        errors.push({ row: i + 2, error: 'Missing email' })
        continue
      }

      if (!isValidEmail(email)) {
        errors.push({ row: i + 2, error: `Invalid email: ${email}` })
        continue
      }

      if (existingEmails.has(email)) {
        duplicates.push(email)
        continue
      }

      // Mark as processed to catch duplicates within the file
      existingEmails.add(email)

      const contact: CSVContact = { email }
      
      if (firstNameIndex !== -1 && row[firstNameIndex]) {
        contact.first_name = row[firstNameIndex].trim()
      }
      
      if (lastNameIndex !== -1 && row[lastNameIndex]) {
        contact.last_name = row[lastNameIndex].trim()
      }

      // Collect additional metadata from other columns
      const metadata: Record<string, string> = {}
      headers.forEach((header, index) => {
        if (index !== emailIndex && 
            index !== firstNameIndex && 
            index !== lastNameIndex && 
            row[index]?.trim()) {
          metadata[header] = row[index].trim()
        }
      })

      contacts.push({
        ...contact,
        ...metadata
      })
    }

    // Insert contacts in batches
    const batchSize = 1000
    let insertedCount = 0

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)
      
      const insertData = batch.map(contact => ({
        organization_id: membership.organization_id,
        audience_id: audienceId,
        email: contact.email,
        first_name: contact.first_name || null,
        last_name: contact.last_name || null,
        metadata: Object.keys(contact).filter(k => 
          !['email', 'first_name', 'last_name'].includes(k)
        ).reduce((acc, key) => ({ ...acc, [key]: contact[key] }), {}),
        subscribed: true,
      }))

      const { error } = await supabaseAdmin
        .from('contacts')
        .insert(insertData)

      if (error) {
        console.error('Failed to insert batch:', error)
      } else {
        insertedCount += batch.length
      }
    }

    return NextResponse.json({
      data: {
        imported: insertedCount,
        duplicates: duplicates.length,
        errors: errors.length,
        total: rows.length,
        errorDetails: errors.slice(0, 10), // First 10 errors
      }
    })

  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json({ 
      error: 'Failed to process CSV file' 
    }, { status: 500 })
  }
}
