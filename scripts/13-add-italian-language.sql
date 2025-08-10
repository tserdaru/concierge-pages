-- Add Italian language support
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_admin_language_check,
  ADD CONSTRAINT users_admin_language_check 
  CHECK (admin_language IN ('en', 'hr', 'de', 'it'));

-- Update existing users to have default language if null
UPDATE public.users 
SET admin_language = 'en' 
WHERE admin_language IS NULL;

-- Add Italian to hotel languages
ALTER TABLE public.hotels 
  DROP CONSTRAINT IF EXISTS hotels_primary_language_check,
  ADD CONSTRAINT hotels_primary_language_check 
  CHECK (primary_language IN ('en', 'hr', 'de', 'it'));

ALTER TABLE public.hotels 
  DROP CONSTRAINT IF EXISTS hotels_secondary_language_check,
  ADD CONSTRAINT hotels_secondary_language_check 
  CHECK (secondary_language IN ('en', 'hr', 'de', 'it'));

-- Update hotel_content language constraints
ALTER TABLE public.hotel_content 
  DROP CONSTRAINT IF EXISTS hotel_content_language_check,
  ADD CONSTRAINT hotel_content_language_check 
  CHECK (language IN ('en', 'hr', 'de', 'it'));

-- Update hotel_assets language constraints  
ALTER TABLE public.hotel_assets 
  DROP CONSTRAINT IF EXISTS hotel_assets_language_check,
  ADD CONSTRAINT hotel_assets_language_check 
  CHECK (language IN ('en', 'hr', 'de', 'it'));

-- Update accordion_sections language constraints
ALTER TABLE public.accordion_sections 
  DROP CONSTRAINT IF EXISTS accordion_sections_language_check,
  ADD CONSTRAINT accordion_sections_language_check 
  CHECK (language IN ('en', 'hr', 'de', 'it'));
