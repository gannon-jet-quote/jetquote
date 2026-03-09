
-- Add payment preferences to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_method_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_link_or_instructions text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_note text DEFAULT NULL;

-- Add completed and payment request fields to proposals
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_request_sent_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_request_sent_to text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_request_subject text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_request_body text DEFAULT NULL;
