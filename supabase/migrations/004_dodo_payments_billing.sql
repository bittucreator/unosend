-- Add Dodo Payments billing fields to workspaces table
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS dodo_customer_id text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS dodo_subscription_id text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS dodo_product_id text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS email_limit integer DEFAULT 5000;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS contacts_limit integer DEFAULT 1500;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS billing_status text DEFAULT 'active';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS billing_cycle_start timestamptz;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS billing_cycle_end timestamptz;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

-- Create index on dodo_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspaces_dodo_customer_id ON workspaces(dodo_customer_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_dodo_subscription_id ON workspaces(dodo_subscription_id);

-- Create usage tracking table if not exists
CREATE TABLE IF NOT EXISTS usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  emails_sent integer DEFAULT 0,
  emails_limit integer DEFAULT 1000,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on workspace_id and period for usage tracking
CREATE INDEX IF NOT EXISTS idx_usage_workspace_period ON usage(workspace_id, period_start, period_end);

-- Create invoices table if not exists
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  dodo_payment_id text,
  amount_paid integer NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending',
  invoice_url text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create index on workspace_id for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_workspace_id ON invoices(workspace_id);

-- Enable RLS on new tables
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage table
CREATE POLICY "Users can view usage for their workspaces" ON usage
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- RLS policies for invoices table  
CREATE POLICY "Users can view invoices for their workspaces" ON invoices
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );
