-- Create storage bucket for hotel assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-assets', 'hotel-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload to own hotel folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hotel-assets' AND
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.slug = split_part(name, '/', 1)
      AND hotels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own hotel assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'hotel-assets' AND
    (
      -- Allow public access for landing pages
      true OR
      -- Allow owners to access their hotel assets
      EXISTS (
        SELECT 1 FROM public.hotels 
        WHERE hotels.slug = split_part(name, '/', 1)
        AND hotels.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own hotel assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'hotel-assets' AND
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.slug = split_part(name, '/', 1)
      AND hotels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own hotel assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hotel-assets' AND
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.slug = split_part(name, '/', 1)
      AND hotels.owner_id = auth.uid()
    )
  );
