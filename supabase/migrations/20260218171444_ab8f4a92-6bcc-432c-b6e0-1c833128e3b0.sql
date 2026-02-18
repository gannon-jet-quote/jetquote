
-- Create proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  service_type TEXT NOT NULL,
  service_address TEXT NOT NULL,
  job_description TEXT NOT NULL,
  total_price_number NUMERIC NOT NULL,
  total_price_formatted TEXT NOT NULL,
  tone TEXT NOT NULL,
  branding JSONB DEFAULT '{}'::jsonb,
  options JSONB DEFAULT '{}'::jsonb,
  proposal_text TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Users can insert their own proposals
CREATE POLICY "Users can insert own proposals"
ON public.proposals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own proposals
CREATE POLICY "Users can view own proposals"
ON public.proposals FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own proposals
CREATE POLICY "Users can update own proposals"
ON public.proposals FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own proposals
CREATE POLICY "Users can delete own proposals"
ON public.proposals FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
