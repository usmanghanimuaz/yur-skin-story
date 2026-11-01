CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own support read" ON public.support_messages FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own support insert" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "admin support write" ON public.support_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.scan_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  stage text NOT NULL,
  status text NOT NULL,
  detail text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scan_logs TO authenticated;
GRANT ALL ON public.scan_logs TO service_role;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scan log read" ON public.scan_logs FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.account_controls (
  user_id uuid PRIMARY KEY,
  blocked boolean NOT NULL DEFAULT false,
  reason text,
  set_by uuid,
  set_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.account_controls TO service_role;
ALTER TABLE public.account_controls ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.locale_overrides (
  locale text NOT NULL,
  label_key text NOT NULL,
  label_value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, label_key)
);
GRANT SELECT ON public.locale_overrides TO anon, authenticated;
GRANT ALL ON public.locale_overrides TO service_role;
ALTER TABLE public.locale_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "labels readable" ON public.locale_overrides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin label write" ON public.locale_overrides FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "deletion admin read" ON public.photo_deletion_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "quota admin read" ON public.analysis_quota FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));