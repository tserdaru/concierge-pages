-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Hotels table policies
CREATE POLICY "Users can view own hotels" ON public.hotels
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own hotels" ON public.hotels
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own hotels" ON public.hotels
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own hotels" ON public.hotels
  FOR DELETE USING (auth.uid() = owner_id);

-- Allow public read access to hotels for landing pages
CREATE POLICY "Public can view hotels for landing pages" ON public.hotels
  FOR SELECT USING (true);

-- Hotel content policies
CREATE POLICY "Users can manage own hotel content" ON public.hotel_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.id = hotel_content.hotel_id 
      AND hotels.owner_id = auth.uid()
    )
  );

-- Allow public read access to hotel content for landing pages
CREATE POLICY "Public can view hotel content" ON public.hotel_content
  FOR SELECT USING (true);

-- Hotel assets policies
CREATE POLICY "Users can manage own hotel assets" ON public.hotel_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE hotels.id = hotel_assets.hotel_id 
      AND hotels.owner_id = auth.uid()
    )
  );

-- Allow public read access to hotel assets for landing pages
CREATE POLICY "Public can view hotel assets" ON public.hotel_assets
  FOR SELECT USING (true);
