-- Add scheduled_for column to emails table for scheduled email support
ALTER TABLE emails ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Add scheduled status to enum if not exists
-- Note: In production, you may need to handle this differently
-- ALTER TYPE email_status ADD VALUE IF NOT EXISTS 'scheduled';

-- Add cancelled status for cancelled emails
-- ALTER TYPE email_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Create index for finding scheduled emails
CREATE INDEX IF NOT EXISTS idx_emails_scheduled ON emails(scheduled_for) 
  WHERE status = 'scheduled' AND scheduled_for IS NOT NULL;

-- Add comment
COMMENT ON COLUMN emails.scheduled_for IS 'ISO 8601 datetime when the email should be sent. Null for immediate sending.';
