-- Add customization fields to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS 
  custom_background_color TEXT DEFAULT '#231f20',
ADD COLUMN IF NOT EXISTS 
  custom_accent_color TEXT DEFAULT '#bf9e58',
ADD COLUMN IF NOT EXISTS 
  logo_asset_id UUID REFERENCES public.hotel_assets(id) ON DELETE SET NULL;

-- Create accordion_sections table for custom sections
CREATE TABLE IF NOT EXISTS public.accordion_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'hr')),
  title TEXT NOT NULL,
  section_key TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hotel_id, language, section_key)
);

-- Create accordion_blocks table for items within sections
CREATE TABLE IF NOT EXISTS public.accordion_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID REFERENCES public.accordion_sections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_asset_id UUID REFERENCES public.hotel_assets(id) ON DELETE SET NULL,
  pdf_asset_id UUID REFERENCES public.hotel_assets(id) ON DELETE SET NULL,
  external_link TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.accordion_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accordion_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for accordion_sections
CREATE POLICY "Users can manage own hotel accordion sections" ON public.accordion_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.id = accordion_sections.hotel_id 
      AND hotels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view accordion sections" ON public.accordion_sections
  FOR SELECT USING (true);

-- RLS policies for accordion_blocks
CREATE POLICY "Users can manage own hotel accordion blocks" ON public.accordion_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.accordion_sections 
      JOIN public.hotels ON hotels.id = accordion_sections.hotel_id
      WHERE accordion_sections.id = accordion_blocks.section_id 
      AND hotels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view accordion blocks" ON public.accordion_blocks
  FOR SELECT USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_accordion_sections_updated_at BEFORE UPDATE ON public.accordion_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accordion_blocks_updated_at BEFORE UPDATE ON public.accordion_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
