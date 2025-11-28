-- Create storage buckets for user and workspace avatars

-- User avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Workspace avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-avatars',
  'workspace-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-avatars bucket

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to user avatars
CREATE POLICY "Public can view user avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- Storage policies for workspace-avatars bucket

-- Allow org members to upload workspace avatar
CREATE POLICY "Org members can upload workspace avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workspace-avatars' AND
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Allow org members to update workspace avatar
CREATE POLICY "Org members can update workspace avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'workspace-avatars' AND
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Allow org members to delete workspace avatar
CREATE POLICY "Org members can delete workspace avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'workspace-avatars' AND
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Allow public read access to workspace avatars
CREATE POLICY "Public can view workspace avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'workspace-avatars');
