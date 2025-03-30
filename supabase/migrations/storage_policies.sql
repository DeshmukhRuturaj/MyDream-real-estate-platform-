-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for properties bucket
-- Allow authenticated users to upload property images
CREATE POLICY "Allow authenticated users to upload property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'properties' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own property images
CREATE POLICY "Allow users to update their own property images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'properties' AND
  auth.uid() = owner
);

-- Allow public to view property images
CREATE POLICY "Allow public to view property images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'properties');

-- Allow users to delete their own property images
CREATE POLICY "Allow users to delete their own property images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'properties' AND
  auth.uid() = owner
);

-- Policies for profiles bucket
-- Allow authenticated users to upload profile images
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own profile images
CREATE POLICY "Allow users to update their own profile images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profiles' AND
  auth.uid() = owner
);

-- Allow public to view profile images
CREATE POLICY "Allow public to view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profiles');

-- Allow users to delete their own profile images
CREATE POLICY "Allow users to delete their own profile images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profiles' AND
  auth.uid() = owner
); 