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
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "re_abc123...")
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
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Email events table (for tracking opens, clicks, etc.)
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
  is_active BOOLEAN DEFAULT true,
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

-- Indexes for better query performance
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

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organization members policies (define FIRST to avoid circular reference)
-- Use simple user_id check to avoid recursion
CREATE POLICY "Users can view their memberships" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert memberships" ON organization_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Organizations policies (now can safely reference organization_members)
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organizations.id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

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

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create default organization for new users
CREATE OR REPLACE FUNCTION create_default_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_slug TEXT;
BEGIN
  -- Generate a unique slug from email
  org_slug := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '-', 'g'));
  org_slug := org_slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Create default organization
  INSERT INTO organizations (name, slug, owner_id)
  VALUES ('My Organization', org_slug, NEW.id)
  RETURNING id INTO org_id;
  
  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creating default organization
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_organization();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
