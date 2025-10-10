/*
  # Create project-images storage bucket

  1. New Storage Bucket
    - `project-images` bucket for storing layout images and project files
    - Public access for reading uploaded images
    - Authenticated users can upload to their own folders

  2. Security Policies
    - Allow authenticated users to upload files to their own user folder
    - Allow public read access to all files in the bucket
    - Allow users to delete their own files
*/

-- Create the project-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images' AND
  (storage.foldername(name))[1] = 'layouts' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-images' AND
  (storage.foldername(name))[1] = 'layouts' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images' AND
  (storage.foldername(name))[1] = 'layouts' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow public read access to all files in the bucket
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-images');

-- Allow anonymous users to upload files (for non-authenticated users)
CREATE POLICY "Anonymous users can upload"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'project-images' AND
  (storage.foldername(name))[1] = 'layouts' AND
  (storage.foldername(name))[2] = 'anonymous'
);