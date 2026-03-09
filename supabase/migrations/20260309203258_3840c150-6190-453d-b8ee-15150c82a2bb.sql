ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS followup_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS followup_scheduled_for timestamp with time zone,
  ADD COLUMN IF NOT EXISTS followup_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS followup_email_subject text,
  ADD COLUMN IF NOT EXISTS followup_email_body text;