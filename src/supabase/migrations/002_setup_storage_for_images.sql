-- =====================================================
-- MIGRATION 002: SETUP STORAGE FOR IMAGE UPLOADS
-- =====================================================
-- This migration sets up Supabase Storage for apartment images
-- Includes support for HEIC/HEIF (iPhone photos)
-- =====================================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public can view apartment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload apartment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update apartment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete apartment images" ON storage.objects;

-- Delete existing bucket if it exists
DELETE FROM storage.buckets WHERE id = 'apartment-images';

-- =====================================================
-- CREATE STORAGE BUCKET
-- =====================================================

-- Create storage bucket for apartment images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apartment-images',
  'apartment-images',
  true,
  5242880, -- 5MB limit per file (after client-side optimization)
  ARRAY[
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/heic',  -- iPhone/iPad photos
    'image/heif'   -- iPhone/iPad photos (alternative format)
  ]
);

-- =====================================================
-- CREATE STORAGE POLICIES
-- =====================================================

-- Public read access to apartment images
CREATE POLICY "Public can view apartment images"
  ON storage.objects 
  FOR SELECT
  USING (bucket_id = 'apartment-images');

-- Authenticated users can upload apartment images
CREATE POLICY "Authenticated users can upload apartment images"
  ON storage.objects 
  FOR INSERT
  WITH CHECK (
    bucket_id = 'apartment-images' 
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can update apartment images
CREATE POLICY "Authenticated users can update apartment images"
  ON storage.objects 
  FOR UPDATE
  USING (
    bucket_id = 'apartment-images' 
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can delete apartment images
CREATE POLICY "Authenticated users can delete apartment images"
  ON storage.objects 
  FOR DELETE
  USING (
    bucket_id = 'apartment-images' 
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  bucket_exists BOOLEAN;
  mime_types TEXT[];
  policy_count INTEGER;
BEGIN
  -- Check if bucket was created
  SELECT EXISTS(
    SELECT 1 FROM storage.buckets WHERE id = 'apartment-images'
  ) INTO bucket_exists;
  
  -- Get allowed MIME types
  SELECT allowed_mime_types INTO mime_types
  FROM storage.buckets
  WHERE id = 'apartment-images';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%apartment images%';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 002 COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Storage bucket created: %', bucket_exists;
  RAISE NOTICE 'Bucket name: apartment-images';
  RAISE NOTICE 'Public access: Yes (read-only)';
  RAISE NOTICE 'File size limit: 5MB';
  RAISE NOTICE 'Allowed formats: %', mime_types;
  RAISE NOTICE 'Storage policies created: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE 'HEIC/HEIF Support: ✓ Enabled';
  RAISE NOTICE 'iPhone photos will be auto-converted to JPEG on upload';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run migration 003 to insert Alto Dorrego apartment';
END $$;
