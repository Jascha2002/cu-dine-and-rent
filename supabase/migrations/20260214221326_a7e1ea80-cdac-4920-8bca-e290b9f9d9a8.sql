
-- Storage bucket for dish images
INSERT INTO storage.buckets (id, name, public) VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view dish images" ON storage.objects FOR SELECT USING (bucket_id = 'dish-images');
CREATE POLICY "Admins can manage dish images" ON storage.objects FOR ALL USING (bucket_id = 'dish-images' AND has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (bucket_id = 'dish-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Central dish image library
CREATE TABLE public.dish_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dish_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view dish images" ON public.dish_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage dish images" ON public.dish_images FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Weekly menus (one per calendar week)
CREATE TABLE public.weekly_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INT NOT NULL,
  week_number INT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(year, week_number)
);
ALTER TABLE public.weekly_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published menus" ON public.weekly_menus FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage menus" ON public.weekly_menus FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_weekly_menus_updated_at BEFORE UPDATE ON public.weekly_menus
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Daily menu items
CREATE TABLE public.daily_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_menu_id UUID NOT NULL REFERENCES public.weekly_menus(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 3), -- 0=Mon, 1=Tue, 2=Wed, 3=Thu
  category TEXT NOT NULL CHECK (category IN ('menu1', 'menu2', 'vegetarisch', 'suppe', 'dessert')),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(5,2) NOT NULL,
  dish_image_id UUID REFERENCES public.dish_images(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_quantity INT DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active menu items" ON public.daily_menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu items" ON public.daily_menu_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Preorders (guest checkout)
CREATE TABLE public.preorders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'sumup' CHECK (payment_method IN ('sumup', 'bar')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  total_amount NUMERIC(7,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create preorders" ON public.preorders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all preorders" ON public.preorders FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update preorders" ON public.preorders FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Preorder items
CREATE TABLE public.preorder_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preorder_id UUID NOT NULL REFERENCES public.preorders(id) ON DELETE CASCADE,
  daily_menu_item_id UUID NOT NULL REFERENCES public.daily_menu_items(id),
  order_date DATE NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.preorder_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create preorder items" ON public.preorder_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view preorder items" ON public.preorder_items FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
