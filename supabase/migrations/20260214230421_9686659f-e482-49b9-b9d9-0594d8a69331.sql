
-- Junction table for many-to-many: menu_dishes <-> dish_images
CREATE TABLE public.menu_dish_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_dish_id UUID NOT NULL REFERENCES public.menu_dishes(id) ON DELETE CASCADE,
  dish_image_id UUID NOT NULL REFERENCES public.dish_images(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(menu_dish_id, dish_image_id)
);

ALTER TABLE public.menu_dish_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dish image links"
  ON public.menu_dish_images FOR SELECT USING (true);

CREATE POLICY "Admins can manage dish image links"
  ON public.menu_dish_images FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
