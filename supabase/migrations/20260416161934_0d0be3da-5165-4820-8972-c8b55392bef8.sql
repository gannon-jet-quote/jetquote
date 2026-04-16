ALTER TABLE public.quote_requests
  ADD COLUMN urgency text,
  ADD COLUMN property_type text,
  ADD COLUMN preferred_contact_method text,
  ADD COLUMN best_contact_time text;