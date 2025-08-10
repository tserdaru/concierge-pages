-- First, let's check what's in the database
SELECT 'Current user:', auth.uid();
SELECT 'Hotels for current user:', h.name, h.slug, h.owner_id 
FROM public.hotels h 
WHERE h.owner_id = auth.uid();

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Users can upload to own hotel folder" ON storage.objects;
DROP POLICY IF EXISTS "Public can view hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own hotel assets" ON storage.objects;

-- Temporarily disable RLS to test upload
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
