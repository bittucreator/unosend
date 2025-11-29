-- Add reply_to column to broadcasts table
ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS reply_to TEXT;

-- Add comment
COMMENT ON COLUMN broadcasts.reply_to IS 'Reply-to email address for broadcast emails';
