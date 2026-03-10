-- Fix any proposals that had status changed to "completed" — restore to "accepted"
UPDATE public.proposals SET status = 'accepted' WHERE status = 'completed' AND accepted_at IS NOT NULL;
-- Also fix any that might have been set to "paid"
UPDATE public.proposals SET status = 'accepted' WHERE status = 'paid' AND accepted_at IS NOT NULL;