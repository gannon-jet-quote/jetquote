-- Add payment_status and payment_received_at to proposals
ALTER TABLE public.proposals 
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_received_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS review_request_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS review_request_sent_to text,
  ADD COLUMN IF NOT EXISTS review_request_subject text,
  ADD COLUMN IF NOT EXISTS review_request_body text;

-- Add review preferences to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS review_platform text,
  ADD COLUMN IF NOT EXISTS review_link text,
  ADD COLUMN IF NOT EXISTS review_signature_name text;

-- Backfill payment_status for proposals that already had payment requests sent
UPDATE public.proposals SET payment_status = 'requested' WHERE payment_request_sent_at IS NOT NULL AND payment_status = 'unpaid';