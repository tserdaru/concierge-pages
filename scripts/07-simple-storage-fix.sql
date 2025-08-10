-- Check current user and hotels
SELECT 'Current user ID:', auth.uid();

-- Check if we have hotels for current user
SELECT 'User hotels:', name, slug, owner_id 
FROM public.hotels 
WHERE owner_id = auth.uid();

-- Instead of disabling RLS, let's create a simpler policy
-- First drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can upload to own hotel folder" ON storage.objects;
    DROP POLICY IF EXISTS "Public can view hotel assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view own hotel assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own hotel assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own hotel assets" ON storage.objects;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Cannot drop policies - insufficient privileges';
END $$;

-- Create a very permissive policy for testing
-- This allows any authenticated user to upload to hotel-assets bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hotel-assets' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'hotel-assets');

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'hotel-assets' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hotel-assets' AND
    auth.uid() IS NOT NULL
  );
