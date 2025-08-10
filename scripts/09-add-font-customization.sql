-- Add font customization to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS 
  custom_font_family TEXT DEFAULT 'Raleway';
