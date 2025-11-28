-- Add styles column to templates table
ALTER TABLE templates ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT NULL;

-- Add styles column to broadcasts table  
ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT NULL;
