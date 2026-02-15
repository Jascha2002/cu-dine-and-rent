-- Add location column to weekly_menus
ALTER TABLE public.weekly_menus ADD COLUMN location TEXT NOT NULL DEFAULT 'bzo';

-- Create index for faster lookups
CREATE INDEX idx_weekly_menus_location ON public.weekly_menus (location);
