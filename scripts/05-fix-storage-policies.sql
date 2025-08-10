-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload to own hotel folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own hotel assets" ON storage.objects;

-- Create improved storage policies
CREATE POLICY "Users can upload to own hotel folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hotel-assets' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.slug = split_part(name, '/', 1)
      AND hotels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view hotel assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'hotel-assets'
  );

CREATE POLICY "Users can update own hotel assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'hotel-assets' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.slug = split_part(name, '/', 1)
      AND hotels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own hotel assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hotel-assets' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.slug = split_part(name, '/', 1)
      AND hotels.owner_id = auth.uid()
    )
  );
