-- Add admin language preference to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS 
  admin_language TEXT DEFAULT 'en' CHECK (admin_language IN ('en', 'hr', 'de'));

-- Add phone editing capability and remove block dimensions
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS 
  supported_languages TEXT[] DEFAULT ARRAY['en', 'hr'];

-- Update accordion_blocks table - remove dimensions, change pdf to link
ALTER TABLE public.accordion_blocks 
  DROP COLUMN IF EXISTS block_width,
  DROP COLUMN IF EXISTS block_height,
  DROP COLUMN IF EXISTS pdf_asset_id,
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Update existing blocks to use external_url instead of pdf
UPDATE public.accordion_blocks 
SET external_url = external_link 
WHERE external_link IS NOT NULL AND external_url IS NULL;
