CREATE OR REPLACE FUNCTION public.is_admin_email(_email text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT lower(coalesce(_email,'')) IN ('usmanghusman1@gmail.com','usmanghanimuaz@gmail.com')
$$;

CREATE OR REPLACE FUNCTION public.enforce_admin_allowlist() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'admin' AND NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = NEW.user_id AND u.email_confirmed_at IS NOT NULL AND public.is_admin_email(u.email)
  ) THEN
    RAISE EXCEPTION 'Admin role is restricted to approved owner accounts';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS enforce_admin_allowlist ON public.user_roles;
CREATE TRIGGER enforce_admin_allowlist BEFORE INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.enforce_admin_allowlist();

CREATE OR REPLACE FUNCTION public.grant_allowlisted_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND public.is_admin_email(NEW.email) THEN
    INSERT INTO public.user_roles (user_id, role) SELECT NEW.id, 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS grant_allowlisted_admin ON auth.users;
CREATE TRIGGER grant_allowlisted_admin AFTER INSERT OR UPDATE OF email_confirmed_at, email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_allowlisted_admin();

-- Backfill: grant admin to already-registered allowlisted accounts.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin' FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL AND public.is_admin_email(u.email)
AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin');

-- Remove any admin role held by a non-allowlisted account.
DELETE FROM public.user_roles r USING auth.users u
WHERE r.user_id = u.id AND r.role = 'admin' AND NOT public.is_admin_email(u.email);