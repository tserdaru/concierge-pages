-- Add custom text fields to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS 
  custom_welcome_title TEXT DEFAULT 'WELCOME TO',
ADD COLUMN IF NOT EXISTS 
  custom_welcome_subtitle TEXT DEFAULT 'Discover exclusive offers, bespoke services and key hotel information.',
ADD COLUMN IF NOT EXISTS 
  custom_phone_instructions TEXT DEFAULT 'For orders and information please use your in-room phone:
- dial 1 for room service
- dial 9 for reception desk
- dial 9 for spa';
