ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS review_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_completed_at timestamp with time zone DEFAULT NULL;
