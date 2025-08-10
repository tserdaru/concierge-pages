-- Add more customization fields to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS 
  custom_text_color TEXT DEFAULT '#ffffff';

-- Add more fields to accordion_blocks for better customization
ALTER TABLE public.accordion_blocks ADD COLUMN IF NOT EXISTS 
  custom_image_url TEXT,
ADD COLUMN IF NOT EXISTS 
  block_width INTEGER DEFAULT 160,
ADD COLUMN IF NOT EXISTS 
  block_height INTEGER DEFAULT 120;
