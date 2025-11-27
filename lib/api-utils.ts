import { createHash, randomBytes } from 'crypto'
import { v4 as uuidv4 } from 'uuid'

// Generate a new API key with the un_ prefix
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomPart = randomBytes(24).toString('base64url')
  const key = `un_${randomPart}`
  const hash = hashApiKey(key)
  const prefix = key.substring(0, 12) // "un_" + first 9 chars
  
  return { key, hash, prefix }
}

// Hash an API key for storage
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

// Generate a webhook secret
export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString('base64url')}`
}

// Generate DNS verification records
export function generateDnsRecords(domain: string) {
  const verificationCode = randomBytes(16).toString('hex')
  
  return [
    {
      type: 'TXT',
      name: `_unosend.${domain}`,
      value: `v=unosend1 k=${verificationCode}`,
      status: 'pending'
    },
    {
      type: 'CNAME',
      name: `mail.${domain}`,
      value: 'mail.unosend.co', // Replace with your actual mail server
      status: 'pending'
    },
    {
      type: 'TXT',
      name: domain,
      value: `v=spf1 include:spf.unosend.co ~all`,
      status: 'pending'
    },
    {
      type: 'TXT',
      name: `_dmarc.${domain}`,
      value: 'v=DMARC1; p=none; rua=mailto:dmarc@unosend.co',
      status: 'pending'
    }
  ]
}

// Generate unique email ID
export function generateEmailId(): string {
  return uuidv4()
}
