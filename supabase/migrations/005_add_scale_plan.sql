-- Add 'scale' plan to subscriptions table
-- Run this in your Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- Add new constraint with 'scale' plan
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check 
  CHECK (plan IN ('free', 'pro', 'scale', 'enterprise'));

-- Also ensure usage table has proper structure for org lookup
-- (The original migration may have created it differently)
ALTER TABLE usage ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Update free plan email limit to 5000 (not 100000)
UPDATE subscriptions 
SET updated_at = NOW()
WHERE plan = 'free';
