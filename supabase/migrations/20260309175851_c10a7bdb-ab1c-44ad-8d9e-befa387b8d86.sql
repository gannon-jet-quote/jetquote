-- Allow anon to read branding by user_id (for public quote request page)
CREATE POLICY "Public can view branding for quote request"
  ON public.branding_settings FOR SELECT
  TO anon
  USING (true);