
-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Create security definer function to check role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id
$$;

-- Create admin-read policy: admins can read all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

-- Create admin-read policy: admins can read all proposals
CREATE POLICY "Admins can view all proposals"
ON public.proposals
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

-- Create admin-read policy: admins can read all branding_settings
CREATE POLICY "Admins can view all branding_settings"
ON public.branding_settings
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');
