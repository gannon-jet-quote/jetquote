ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

-- Backfill any nulls just in case
UPDATE public.profiles SET plan = 'free' WHERE plan IS NULL;

-- Optional sanity constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro'));