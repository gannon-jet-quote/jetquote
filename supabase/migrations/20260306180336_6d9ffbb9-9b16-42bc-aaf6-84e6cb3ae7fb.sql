-- Add status and response tracking columns
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS public_token text UNIQUE;

-- Update existing proposals: if sent_at is set, mark as 'sent', otherwise 'draft'
UPDATE public.proposals SET status = 'sent' WHERE sent_at IS NOT NULL;
UPDATE public.proposals SET status = 'draft' WHERE sent_at IS NULL;

-- RLS policy: allow public read of proposal by public_token (for client response page)
CREATE POLICY "Public can view proposal by token"
  ON public.proposals
  FOR SELECT
  TO anon
  USING (public_token IS NOT NULL);

-- RLS policy: allow public update of status fields by token
CREATE POLICY "Public can respond to proposal by token"
  ON public.proposals
  FOR UPDATE
  TO anon
  USING (public_token IS NOT NULL)
  WITH CHECK (public_token IS NOT NULL);