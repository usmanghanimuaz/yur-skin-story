CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.catalogue_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  brand text NOT NULL DEFAULT '' CHECK (char_length(brand) <= 100),
  category text NOT NULL DEFAULT 'other',
  actives text NOT NULL DEFAULT '',
  targets text[] NOT NULL DEFAULT '{}',
  pregnancy_safe boolean,
  status text NOT NULL DEFAULT 'seed_pending_review' CHECK (status IN ('seed_pending_review','reviewed','retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.catalogue_products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.catalogue_products TO authenticated;
GRANT ALL ON public.catalogue_products TO service_role;
ALTER TABLE public.catalogue_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogue read" ON public.catalogue_products FOR SELECT TO authenticated USING (status <> 'retired' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "catalogue admin write" ON public.catalogue_products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.product_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.catalogue_products(id) ON DELETE CASCADE,
  country text NOT NULL CHECK (char_length(country) BETWEEN 2 AND 60),
  retailer text NOT NULL DEFAULT '',
  price numeric(10,2),
  currency text,
  price_verified_at timestamptz,
  url text CHECK (url IS NULL OR url ~ '^https://'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_availability TO authenticated;
GRANT ALL ON public.product_availability TO service_role;
ALTER TABLE public.product_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability read" ON public.product_availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "availability admin write" ON public.product_availability FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.evidence_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient text NOT NULL CHECK (char_length(ingredient) BETWEEN 1 AND 100),
  concern text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 2000),
  source_url text CHECK (source_url IS NULL OR source_url ~ '^https://'),
  status text NOT NULL DEFAULT 'seed_pending_review' CHECK (status IN ('seed_pending_review','reviewed','retired')),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_entries TO authenticated;
GRANT ALL ON public.evidence_entries TO service_role;
ALTER TABLE public.evidence_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evidence read reviewed" ON public.evidence_entries FOR SELECT TO authenticated USING (status = 'reviewed' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "evidence admin write" ON public.evidence_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.profiles ADD COLUMN locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en','es','fr','it','de','pt','nl','ur','ur-Latn'));
ALTER TABLE public.photo_deletion_requests ADD COLUMN attempts int NOT NULL DEFAULT 0;
ALTER TABLE public.photo_deletion_requests ADD COLUMN last_error text;