
-- Create the update_updated_at function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'Vollzeit',
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT DEFAULT '',
  benefits TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs"
ON public.jobs FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage jobs"
ON public.jobs FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  message TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit application"
ON public.job_applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete applications"
ON public.job_applications FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for menu uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('menus', 'menus', true);

CREATE POLICY "Anyone can view menus"
ON storage.objects FOR SELECT
USING (bucket_id = 'menus');

CREATE POLICY "Admins can upload menus"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menus' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update menus"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menus' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete menus"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menus' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for jobs updated_at
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
