import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

// Get encryption key from environment or generate a fallback for development
function getEncryptionKey(): Buffer {
  const key = process.env.API_KEY_ENCRYPTION_SECRET
  if (!key) {
    // In development, use a derived key (NOT for production!)
    console.warn('[Crypto] No API_KEY_ENCRYPTION_SECRET set, using fallback for development')
    return crypto.scryptSync('development-fallback-key', 'salt', 32)
  }
  // If key is provided, derive a proper 32-byte key from it
  return crypto.scryptSync(key, 'unosend-api-keys', 32)
}

/**
 * Encrypt an API key for storage
 */
export function encryptApiKey(apiKey: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Format: iv:authTag:encryptedData (all in hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt an API key from storage
 */
export function decryptApiKey(encryptedData: string): string | null {
  try {
    const key = getEncryptionKey()
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
    
    if (!ivHex || !authTagHex || !encrypted) {
      console.error('[Crypto] Invalid encrypted data format')
      return null
    }
    
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('[Crypto] Failed to decrypt API key:', error)
    return null
  }
}
