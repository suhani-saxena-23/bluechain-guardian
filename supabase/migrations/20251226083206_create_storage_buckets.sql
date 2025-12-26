/*
  # Create Storage Buckets for File Uploads

  1. Buckets
    - `project-photos` - For project photo uploads
    - `project-videos` - For project video uploads
    - `documents` - For user verification documents
    
  2. Security
    - Enable RLS on storage objects
    - Users can upload to their own folders
    - Public read access for verified project media
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('project-photos', 'project-photos', true),
  ('project-videos', 'project-videos', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project-photos
CREATE POLICY "Users can upload project photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own project photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'project-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own project photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view project photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-photos');

-- Storage policies for project-videos
CREATE POLICY "Users can upload project videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own project videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'project-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own project videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view project videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-videos');

-- Storage policies for documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'validator'
  )
);
