DROP POLICY IF EXISTS "anyone can read page wording" ON public.content_overrides;
CREATE POLICY "anyone can read page wording" ON public.content_overrides FOR SELECT TO anon, authenticated
  USING (locale IN ('en','es','fr','it','de','pt','nl','ur','ur-Latn'));
DROP POLICY IF EXISTS "labels readable" ON public.locale_overrides;
CREATE POLICY "labels readable" ON public.locale_overrides FOR SELECT TO anon, authenticated
  USING (locale IN ('en','es','fr','it','de','pt','nl','ur','ur-Latn'));
DROP POLICY IF EXISTS "availability read" ON public.product_availability;
CREATE POLICY "availability read" ON public.product_availability FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.catalogue_products c WHERE c.id = product_id AND (c.status <> 'retired' OR public.has_role(auth.uid(), 'admin'::app_role))));