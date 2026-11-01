ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_scans boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_scans_at timestamptz;