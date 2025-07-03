/*
  # Create storage bucket for project images

  1. New Storage
    - Creates a storage bucket for project images if it doesn't exist
    - Sets up appropriate security policies for the bucket
  
  2. Security
    - Enables public access for authenticated users
    - Allows users to upload and manage their own files
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
DO $$
BEGIN
  -- Allow public read access to all objects
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Read Access' AND bucket_id = 'project-images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Public Read Access',
      'project-images',
      '{"name":"Public Read Access","id":"project-images","statement":"bucket_id=''project-images''","effect":"allow","actions":["select"],"role":"anon","resource":"object"}'
    );
  END IF;

  -- Allow authenticated users to upload files
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Authenticated Users Can Upload' AND bucket_id = 'project-images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Authenticated Users Can Upload',
      'project-images',
      '{"name":"Authenticated Users Can Upload","id":"project-images","statement":"bucket_id=''project-images''","effect":"allow","actions":["insert"],"role":"authenticated","resource":"object"}'
    );
  END IF;

  -- Allow users to manage their own files
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users Can Manage Own Files' AND bucket_id = 'project-images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Users Can Manage Own Files',
      'project-images',
      '{"name":"Users Can Manage Own Files","id":"project-images","statement":"bucket_id=''project-images'' AND (storage.foldername(name)::text = auth.uid()::text)","effect":"allow","actions":["select","insert","update","delete"],"role":"authenticated","resource":"object"}'
    );
  END IF;
END $$;