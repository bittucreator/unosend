-- Add icon_url column to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);

-- Update RLS policies for organizations to allow insert
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own organizations (if owner/admin)
DROP POLICY IF EXISTS "Owners can update organizations" ON organizations;
CREATE POLICY "Owners can update organizations" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Allow owners to delete their organizations
DROP POLICY IF EXISTS "Owners can delete organizations" ON organizations;
CREATE POLICY "Owners can delete organizations" ON organizations
  FOR DELETE USING (auth.uid() = owner_id);
