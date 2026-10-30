CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  onboarding_step int NOT NULL DEFAULT 0,
  onboarded boolean NOT NULL DEFAULT false,
  weekly_reminder boolean NOT NULL DEFAULT true,
  routine_reminders boolean NOT NULL DEFAULT false,
  routine_morning text DEFAULT '07:30',
  routine_night text DEFAULT '21:30',
  consent_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.person_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  is_me boolean NOT NULL DEFAULT false,
  skin_type text,
  age_band text,
  country text,
  pregnancy boolean NOT NULL DEFAULT false,
  allergies text CHECK (allergies IS NULL OR char_length(allergies) <= 300),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.person_profiles TO authenticated;
GRANT ALL ON public.person_profiles TO service_role;
ALTER TABLE public.person_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own persons read" ON public.person_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own persons insert" ON public.person_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own persons update" ON public.person_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_person_cap() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));
  IF (SELECT count(*) FROM public.person_profiles WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'PROFILE_LIMIT: maximum 3 people per account';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER person_cap BEFORE INSERT ON public.person_profiles FOR EACH ROW EXECUTE FUNCTION public.enforce_person_cap();

CREATE OR REPLACE FUNCTION public.lock_person_owner() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.user_id := OLD.user_id; RETURN NEW; END $$;
CREATE TRIGGER person_owner_lock BEFORE UPDATE ON public.person_profiles FOR EACH ROW EXECUTE FUNCTION public.lock_person_owner();

CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.person_profiles(id) ON DELETE CASCADE,
  photo_path text,
  check_in_date timestamptz NOT NULL DEFAULT now(),
  overall_score int NOT NULL,
  metrics jsonb NOT NULL,
  engine text NOT NULL,
  engine_scores jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX check_ins_profile_date ON public.check_ins(profile_id, check_in_date DESC);
GRANT SELECT ON public.check_ins TO authenticated;
GRANT ALL ON public.check_ins TO service_role;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own checkins read" ON public.check_ins FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.skin_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  profile_id uuid NOT NULL REFERENCES public.person_profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  brand text CHECK (brand IS NULL OR char_length(brand) <= 100),
  actives text CHECK (actives IS NULL OR char_length(actives) <= 200),
  routine_slot text NOT NULL DEFAULT 'both',
  started_date date NOT NULL DEFAULT current_date,
  stopped_date date,
  notes text CHECK (notes IS NULL OR char_length(notes) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skin_products TO authenticated;
GRANT ALL ON public.skin_products TO service_role;
ALTER TABLE public.skin_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own products all" ON public.skin_products FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.person_profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));

CREATE TABLE public.advice_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  check_in_id uuid NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
  recommendation_key text NOT NULL CHECK (char_length(recommendation_key) <= 60),
  helpful boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, check_in_id, recommendation_key)
);
GRANT SELECT, INSERT, UPDATE ON public.advice_feedback TO authenticated;
GRANT ALL ON public.advice_feedback TO service_role;
ALTER TABLE public.advice_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback read" ON public.advice_feedback FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "own feedback insert" ON public.advice_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.check_ins c WHERE c.id = check_in_id AND c.owner_id = auth.uid()));
CREATE POLICY "own feedback update" ON public.advice_feedback FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.analysis_quota (
  owner_id uuid NOT NULL,
  window_key text NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (owner_id, window_key)
);
GRANT ALL ON public.analysis_quota TO service_role;
ALTER TABLE public.analysis_quota ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.photo_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  photo_path text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.photo_uploads TO service_role;
ALTER TABLE public.photo_uploads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.photo_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  photo_path text NOT NULL,
  check_in_id uuid UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT ALL ON public.photo_deletion_requests TO service_role;
ALTER TABLE public.photo_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.account_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  event text NOT NULL CHECK (event IN ('sign_in','password_changed','settings_updated','data_export','data_access')),
  detail text CHECK (detail IS NULL OR char_length(detail) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.account_activity TO authenticated;
GRANT ALL ON public.account_activity TO service_role;
ALTER TABLE public.account_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activity read" ON public.account_activity FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "own activity insert" ON public.account_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "own photos upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'checkin-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own photos read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'checkin-photos' AND (storage.foldername(name))[1] = auth.uid()::text);