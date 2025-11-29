-- Add encrypted_key column to store retrievable API keys
-- The key is encrypted server-side before storage

ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS encrypted_key TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN api_keys.encrypted_key IS 'AES-256-GCM encrypted API key for user retrieval. Encrypted with server-side key.';
