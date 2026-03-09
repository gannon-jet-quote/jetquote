-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;

-- Create index for fast lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Create quote_requests table
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  service_type text NOT NULL,
  property_address text NOT NULL,
  project_description text NOT NULL,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own quote requests
CREATE POLICY "Users can view own quote requests"
  ON public.quote_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow public select on profiles by username (needed for the public quote request page)
CREATE POLICY "Public can view profiles by username"
  ON public.profiles FOR SELECT
  TO anon
  USING (username IS NOT NULL);