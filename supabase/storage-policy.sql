-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'properties' AND
  (storage.foldername(name))[1] = 'property-images'
);

-- Allow public access to view files
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'properties' AND
  (storage.foldername(name))[1] = 'property-images'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'properties' AND
  (storage.foldername(name))[1] = 'property-images' AND
  owner = auth.uid()
)
WITH CHECK (
  bucket_id = 'properties' AND
  (storage.foldername(name))[1] = 'property-images'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'properties' AND
  (storage.foldername(name))[1] = 'property-images' AND
  owner = auth.uid()
); 