-- Add invitations table for pending team invites
-- Run this in Supabase SQL Editor

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_organization ON invitations(organization_id);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view invitations" ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = invitations.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can create invitations" ON invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = invitations.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete invitations" ON invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = invitations.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
