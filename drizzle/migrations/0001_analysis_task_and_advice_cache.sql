ALTER TABLE public.photo_uploads ADD COLUMN profile_id uuid REFERENCES public.person_profiles(id) ON DELETE CASCADE, ADD COLUMN task_id text, ADD COLUMN notes text, ADD COLUMN quota_windows jsonb, ADD COLUMN check_in_id uuid;
CREATE TABLE public.skin_advice (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, check_in_id uuid NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE, safety_hash text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(check_in_id, safety_hash)
);
GRANT SELECT ON public.skin_advice TO authenticated;
GRANT ALL ON public.skin_advice TO service_role;
ALTER TABLE public.skin_advice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cached advice" ON public.skin_advice FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE OR REPLACE FUNCTION public.reserve_analysis_quota(p_owner uuid,p_short text,p_day text,p_app text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c int;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('skintwin-analysis'));
 INSERT INTO public.analysis_quota(owner_id,window_key,count) VALUES(p_owner,p_short,0),(p_owner,p_day,0),('00000000-0000-0000-0000-000000000000',p_app,0) ON CONFLICT DO NOTHING;
 SELECT count INTO c FROM public.analysis_quota WHERE owner_id=p_owner AND window_key=p_short;
 IF c>=3 THEN RAISE EXCEPTION 'Please wait a few minutes before your next check-in'; END IF;
 SELECT count INTO c FROM public.analysis_quota WHERE owner_id=p_owner AND window_key=p_day;
 IF c>=10 THEN RAISE EXCEPTION 'Daily fair-use limit reached. Come back tomorrow'; END IF;
 SELECT count INTO c FROM public.analysis_quota WHERE owner_id='00000000-0000-0000-0000-000000000000' AND window_key=p_app;
 IF c>=500 THEN RAISE EXCEPTION 'Analysis is busy today. Please try again tomorrow'; END IF;
 UPDATE public.analysis_quota SET count=count+1 WHERE (owner_id=p_owner AND window_key IN(p_short,p_day)) OR (owner_id='00000000-0000-0000-0000-000000000000' AND window_key=p_app);
END $$;
REVOKE ALL ON FUNCTION public.reserve_analysis_quota(uuid,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_analysis_quota(uuid,text,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.release_analysis_quota(p_owner uuid,p_short text,p_day text,p_app text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 UPDATE public.analysis_quota SET count=greatest(0,count-1) WHERE (owner_id=p_owner AND window_key IN(p_short,p_day)) OR (owner_id='00000000-0000-0000-0000-000000000000' AND window_key=p_app);
END $$;
REVOKE ALL ON FUNCTION public.release_analysis_quota(uuid,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_analysis_quota(uuid,text,text,text) TO service_role;