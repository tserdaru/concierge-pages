-- Add domain fields to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS 
  custom_domain TEXT,
ADD COLUMN IF NOT EXISTS 
  custom_subdomain TEXT;

-- Add PDF support back to accordion_blocks
ALTER TABLE public.accordion_blocks ADD COLUMN IF NOT EXISTS 
  pdf_asset_id UUID REFERENCES public.hotel_assets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS 
  click_action TEXT DEFAULT 'none' CHECK (click_action IN ('none', 'link', 'pdf'));

-- Update existing blocks to have click_action
UPDATE public.accordion_blocks 
SET click_action = CASE 
  WHEN external_url IS NOT NULL THEN 'link'
  ELSE 'none'
END;

-- Add more language support
ALTER TABLE public.hotels 
  DROP CONSTRAINT IF EXISTS hotels_primary_language_check,
  ADD CONSTRAINT hotels_primary_language_check 
  CHECK (primary_language IN ('en', 'hr', 'de', 'it', 'fr', 'es', 'pt', 'ru', 'zh', 'ja'));

ALTER TABLE public.hotels 
  DROP CONSTRAINT IF EXISTS hotels_secondary_language_check,
  ADD CONSTRAINT hotels_secondary_language_check 
  CHECK (secondary_language IN ('en', 'hr', 'de', 'it', 'fr', 'es', 'pt', 'ru', 'zh', 'ja'));

-- Update other language constraints
ALTER TABLE public.hotel_content 
  DROP CONSTRAINT IF EXISTS hotel_content_language_check,
  ADD CONSTRAINT hotel_content_language_check 
  CHECK (language IN ('en', 'hr', 'de', 'it', 'fr', 'es', 'pt', 'ru', 'zh', 'ja'));

ALTER TABLE public.hotel_assets 
  DROP CONSTRAINT IF EXISTS hotel_assets_language_check,
  ADD CONSTRAINT hotel_assets_language_check 
  CHECK (language IN ('en', 'hr', 'de', 'it', 'fr', 'es', 'pt', 'ru', 'zh', 'ja'));

ALTER TABLE public.accordion_sections 
  DROP CONSTRAINT IF EXISTS accordion_sections_language_check,
  ADD CONSTRAINT accordion_sections_language_check 
  CHECK (language IN ('en', 'hr', 'de', 'it', 'fr', 'es', 'pt', 'ru', 'zh', 'ja'));
