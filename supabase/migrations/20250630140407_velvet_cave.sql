/*
  # Add storage bucket for project images

  1. New Storage Bucket
    - Create a new storage bucket for project images
    - Set up public access for project images
    - Configure RLS policies for the bucket

  2. Security
    - Enable RLS on the bucket
    - Add policies for users to manage their own images
    - Allow public read access to images
*/

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'Project Images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload project images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-images' AND
    (auth.uid() = (storage.foldername(name))[1])
  );

CREATE POLICY "Users can update their own project images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-images' AND
    (auth.uid() = (storage.foldername(name))[1])
  );

CREATE POLICY "Users can delete their own project images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-images' AND
    (auth.uid() = (storage.foldername(name))[1])
  );

CREATE POLICY "Anyone can view project images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'project-images');