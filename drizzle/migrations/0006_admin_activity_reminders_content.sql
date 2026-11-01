CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_email text,
  action text NOT NULL,
  target text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.admin_activity_log IS 'Audit trail of maintainer actions taken from the admin page.';
GRANT SELECT, INSERT ON public.admin_activity_log TO authenticated;
GRANT ALL ON public.admin_activity_log TO service_role;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read the activity log" ON public.admin_activity_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write the activity log" ON public.admin_activity_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX admin_activity_log_created_idx ON public.admin_activity_log (created_at DESC);

CREATE TABLE public.reminder_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('weekly', 'routine')),
  bucket text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, kind, bucket)
);
COMMENT ON TABLE public.reminder_deliveries IS 'One row per reminder a person has already been given for a period, so the same reminder is never repeated.';
GRANT SELECT ON public.reminder_deliveries TO authenticated;
GRANT ALL ON public.reminder_deliveries TO service_role;
ALTER TABLE public.reminder_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "people read their own reminder records" ON public.reminder_deliveries FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "admins read reminder records" ON public.reminder_deliveries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX reminder_deliveries_sent_idx ON public.reminder_deliveries (sent_at DESC);

CREATE TABLE public.content_overrides (
  locale text NOT NULL,
  page_key text NOT NULL,
  text_key text NOT NULL,
  text_value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, page_key, text_key)
);
COMMENT ON TABLE public.content_overrides IS 'Maintainer-written page wording per language, shown instead of the built-in text.';
GRANT SELECT ON public.content_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_overrides TO authenticated;
GRANT ALL ON public.content_overrides TO service_role;
ALTER TABLE public.content_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read page wording" ON public.content_overrides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins add page wording" ON public.content_overrides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins change page wording" ON public.content_overrides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins remove page wording" ON public.content_overrides FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));