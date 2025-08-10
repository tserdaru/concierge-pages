-- 1) Limit languages to only en, hr, de, it across relevant tables
ALTER TABLE public.hotels 
  DROP CONSTRAINT IF EXISTS hotels_primary_language_check,
  ADD CONSTRAINT hotels_primary_language_check CHECK (primary_language IN ('en','hr','de','it'));

ALTER TABLE public.hotels 
  DROP CONSTRAINT IF EXISTS hotels_secondary_language_check,
  ADD CONSTRAINT hotels_secondary_language_check CHECK (secondary_language IN ('en','hr','de','it'));

ALTER TABLE public.hotel_content 
  DROP CONSTRAINT IF EXISTS hotel_content_language_check,
  ADD CONSTRAINT hotel_content_language_check CHECK (language IN ('en','hr','de','it'));

ALTER TABLE public.hotel_assets 
  DROP CONSTRAINT IF EXISTS hotel_assets_language_check,
  ADD CONSTRAINT hotel_assets_language_check CHECK (language IN ('en','hr','de','it') OR language IS NULL);

ALTER TABLE public.accordion_sections 
  DROP CONSTRAINT IF EXISTS accordion_sections_language_check,
  ADD CONSTRAINT accordion_sections_language_check CHECK (language IN ('en','hr','de','it'));

-- 2) Add/adjust hotel domain and style columns
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS custom_domain TEXT,
  ADD COLUMN IF NOT EXISTS custom_subdomain TEXT,
  ADD COLUMN IF NOT EXISTS custom_font_url TEXT,
  ADD COLUMN IF NOT EXISTS custom_phone_color TEXT;

-- 3) Allow 'font' as an asset type for hotel_assets
-- Convert the existing check constraint to include 'font'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage ccu
    WHERE ccu.table_schema = 'public'
      AND ccu.table_name = 'hotel_assets'
      AND ccu.column_name = 'file_type'
  ) THEN
    ALTER TABLE public.hotel_assets
      DROP CONSTRAINT IF EXISTS hotel_assets_file_type_check;
  END IF;
END$$;

ALTER TABLE public.hotel_assets
  ADD CONSTRAINT hotel_assets_file_type_check
  CHECK (file_type IN ('image','pdf','font'));

-- 4) Enhance blocks with PDF and click_action including 'image'
ALTER TABLE public.accordion_blocks
  ADD COLUMN IF NOT EXISTS pdf_asset_id UUID REFERENCES public.hotel_assets(id) ON DELETE SET NULL;

-- Replace existing click_action constraint (if exists) to include 'image'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage ccu
    WHERE ccu.table_schema = 'public'
      AND ccu.table_name = 'accordion_blocks'
      AND ccu.column_name = 'click_action'
  ) THEN
    ALTER TABLE public.accordion_blocks
      DROP CONSTRAINT IF EXISTS accordion_blocks_click_action_check;
  END IF;
END$$;

ALTER TABLE public.accordion_blocks
  ADD COLUMN IF NOT EXISTS click_action TEXT DEFAULT 'none';

ALTER TABLE public.accordion_blocks
  ADD CONSTRAINT accordion_blocks_click_action_check
  CHECK (click_action IN ('none','link','pdf','image'));

-- Default is_active true if the column exists but has nulls
UPDATE public.accordion_blocks SET is_active = TRUE WHERE is_active IS NULL;

-- 5) Backfill click_action from existing data
UPDATE public.accordion_blocks
SET click_action = CASE
  WHEN external_url IS NOT NULL THEN 'link'
  ELSE 'none'
END
WHERE click_action IS NULL;
