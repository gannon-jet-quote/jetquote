-- system_events table for admin health check
CREATE TABLE IF NOT EXISTS public.system_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  event_source text,
  user_id uuid,
  proposal_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON public.system_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_events_type_created ON public.system_events (event_type, created_at DESC);

ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- Admins can read all events
CREATE POLICY "Admins can view all system events"
  ON public.system_events FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Service role can insert (edge functions)
CREATE POLICY "Service role can insert system events"
  ON public.system_events FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can insert their own events (for client-triggered actions like manual sends)
CREATE POLICY "Users can insert own system events"
  ON public.system_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Anonymous can insert events when responding via public token (accept/decline)
CREATE POLICY "Anon can insert proposal response events"
  ON public.system_events FOR INSERT
  TO anon
  WITH CHECK (event_type IN ('proposal_accepted', 'proposal_declined'));
