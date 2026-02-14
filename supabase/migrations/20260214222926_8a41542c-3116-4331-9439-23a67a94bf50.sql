
-- Gerichtekatalog-Tabelle: Zentrale Liste aller verfügbaren Gerichte
CREATE TABLE public.menu_dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'menu1',
  default_price NUMERIC NOT NULL DEFAULT 6.50,
  dish_image_id UUID REFERENCES public.dish_images(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.menu_dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active dishes"
  ON public.menu_dishes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage dishes"
  ON public.menu_dishes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
