-- ============================================
-- COMPLETE SETUP SCRIPT FOR RESEND CLONE
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: RESET (Drop everything if exists)
-- ============================================

-- Drop triggers first (ignore errors if they don't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_profile_created ON profiles;
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_webhooks_updated_at ON webhooks;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_usage_updated_at ON usage;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_default_organization() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS broadcast_recipients CASCADE;
DROP TABLE IF EXISTS broadcasts CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS audiences CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS usage CASCADE;
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS email_clicks CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS email_events CASCADE;
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- PART 2: CREATE TABLES
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members table
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Domains table
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  dns_records JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, domain)
);

-- Emails table
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  reply_to TEXT,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'failed')),
  provider_message_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE
);

-- Email events table
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, period_start, period_end)
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'html' CHECK (type IN ('html', 'text')),
  html_content TEXT,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audiences table (contact lists)
CREATE TABLE audiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  audience_id UUID REFERENCES audiences(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Broadcasts table
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  audience_id UUID REFERENCES audiences(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook logs table
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  success BOOLEAN DEFAULT false,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email clicks table (for click tracking)
CREATE TABLE email_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 3: CREATE INDEXES
-- ============================================

CREATE INDEX idx_api_keys_organization ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_domains_organization ON domains(organization_id);
CREATE INDEX idx_domains_domain ON domains(domain);
CREATE INDEX idx_emails_organization ON emails(organization_id);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_created_at ON emails(created_at);
CREATE INDEX idx_email_events_email ON email_events(email_id);
CREATE INDEX idx_email_events_type ON email_events(event_type);
CREATE INDEX idx_usage_organization ON usage(organization_id);
CREATE INDEX idx_usage_period ON usage(period_start, period_end);
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX idx_email_clicks_email ON email_clicks(email_id);
CREATE INDEX idx_templates_organization ON templates(organization_id);
CREATE INDEX idx_audiences_organization ON audiences(organization_id);
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_contacts_audience ON contacts(audience_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_broadcasts_organization ON broadcasts(organization_id);
CREATE INDEX idx_broadcasts_status ON broadcasts(status);

-- ============================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: CREATE RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role and trigger functions to insert profiles
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Organization members policies (simple - no circular refs)
CREATE POLICY "Users can view their memberships" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

-- Allow service role and trigger functions to insert memberships
CREATE POLICY "Service role can insert memberships" ON organization_members
  FOR INSERT WITH CHECK (true);

-- Organizations policies
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organizations.id AND user_id = auth.uid())
  );

-- Allow service role and trigger functions to insert organizations
CREATE POLICY "Service role can insert organizations" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can update their organizations" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their organizations" ON organizations
  FOR DELETE USING (owner_id = auth.uid());

-- API Keys policies
CREATE POLICY "Members can view API keys" ON api_keys
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = api_keys.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert API keys" ON api_keys
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = api_keys.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update API keys" ON api_keys
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = api_keys.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete API keys" ON api_keys
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = api_keys.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Domains policies
CREATE POLICY "Members can view domains" ON domains
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = domains.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert domains" ON domains
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = domains.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update domains" ON domains
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = domains.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete domains" ON domains
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = domains.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Emails policies
CREATE POLICY "Members can view emails" ON emails
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = emails.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Members can insert emails" ON emails
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = emails.organization_id AND user_id = auth.uid())
  );

-- Email events policies
CREATE POLICY "Members can view email events" ON email_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM emails 
      WHERE emails.id = email_events.email_id 
      AND EXISTS (SELECT 1 FROM organization_members WHERE organization_id = emails.organization_id AND user_id = auth.uid())
    )
  );

-- Webhooks policies
CREATE POLICY "Members can view webhooks" ON webhooks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = webhooks.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert webhooks" ON webhooks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = webhooks.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update webhooks" ON webhooks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = webhooks.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete webhooks" ON webhooks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = webhooks.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Usage policies
CREATE POLICY "Members can view usage" ON usage
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = usage.organization_id AND user_id = auth.uid())
  );

-- Webhook logs policies (service role only for inserts)
CREATE POLICY "Members can view webhook logs" ON webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhooks 
      WHERE webhooks.id = webhook_logs.webhook_id 
      AND EXISTS (SELECT 1 FROM organization_members WHERE organization_id = webhooks.organization_id AND user_id = auth.uid())
    )
  );

-- Email clicks policies
CREATE POLICY "Members can view email clicks" ON email_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM emails 
      WHERE emails.id = email_clicks.email_id 
      AND EXISTS (SELECT 1 FROM organization_members WHERE organization_id = emails.organization_id AND user_id = auth.uid())
    )
  );

-- Templates policies
CREATE POLICY "Members can view templates" ON templates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = templates.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert templates" ON templates
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = templates.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update templates" ON templates
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = templates.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete templates" ON templates
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = templates.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Audiences policies
CREATE POLICY "Members can view audiences" ON audiences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = audiences.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert audiences" ON audiences
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = audiences.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update audiences" ON audiences
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = audiences.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete audiences" ON audiences
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = audiences.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Contacts policies
CREATE POLICY "Members can view contacts" ON contacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = contacts.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert contacts" ON contacts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = contacts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update contacts" ON contacts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = contacts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete contacts" ON contacts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = contacts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Broadcasts policies
CREATE POLICY "Members can view broadcasts" ON broadcasts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = broadcasts.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert broadcasts" ON broadcasts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = broadcasts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update broadcasts" ON broadcasts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = broadcasts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete broadcasts" ON broadcasts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = broadcasts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ============================================
-- PART 6: CREATE FUNCTIONS
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create default organization for new users
CREATE OR REPLACE FUNCTION create_default_organization()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
  org_slug TEXT;
BEGIN
  -- Generate a unique slug from email
  org_slug := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '-', 'g'));
  org_slug := org_slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Create default organization
  INSERT INTO public.organizations (name, slug, owner_id)
  VALUES ('My Organization', org_slug, NEW.id)
  RETURNING id INTO org_id;
  
  -- Add user as owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 7: CREATE TRIGGERS
-- ============================================

-- Trigger for new user creation (on auth.users)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger for creating default organization (on profiles)
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_organization();

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usage_updated_at
  BEFORE UPDATE ON usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PART 8: SETUP EXISTING USERS (if any)
-- ============================================

-- Create profiles for any existing auth users who don't have one
INSERT INTO profiles (id, email, full_name, avatar_url)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Create organizations for profiles that don't have one
DO $$
DECLARE
  profile_record RECORD;
  org_id UUID;
  org_slug TEXT;
BEGIN
  FOR profile_record IN 
    SELECT p.id, p.email 
    FROM profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM organization_members om WHERE om.user_id = p.id
    )
  LOOP
    -- Generate slug
    org_slug := LOWER(REGEXP_REPLACE(SPLIT_PART(profile_record.email, '@', 1), '[^a-z0-9]', '-', 'g'));
    org_slug := org_slug || '-' || SUBSTRING(profile_record.id::TEXT, 1, 8);
    
    -- Create org
    INSERT INTO organizations (name, slug, owner_id)
    VALUES ('My Organization', org_slug, profile_record.id)
    RETURNING id INTO org_id;
    
    -- Add as owner
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_id, profile_record.id, 'owner');
  END LOOP;
END $$;

-- ============================================
-- DONE! 
-- Now sign up with a new account in your app.
-- The triggers will auto-create profile & organization.
-- ============================================
