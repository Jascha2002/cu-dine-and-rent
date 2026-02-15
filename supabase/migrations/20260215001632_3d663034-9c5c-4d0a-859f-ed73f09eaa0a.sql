
-- Add pickup number and customer address to preorders
ALTER TABLE public.preorders 
ADD COLUMN IF NOT EXISTS pickup_number TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT DEFAULT '';

-- Create a sequence for pickup numbers (daily reset approach: use date prefix + counter)
CREATE OR REPLACE FUNCTION public.generate_pickup_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_count INTEGER;
  today_str TEXT;
BEGIN
  today_str := to_char(NOW(), 'YYMMDD');
  SELECT COUNT(*) + 1 INTO today_count 
  FROM public.preorders 
  WHERE pickup_number LIKE today_str || '%';
  NEW.pickup_number := today_str || '-' || LPAD(today_count::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_pickup_number
BEFORE INSERT ON public.preorders
FOR EACH ROW
EXECUTE FUNCTION public.generate_pickup_number();
