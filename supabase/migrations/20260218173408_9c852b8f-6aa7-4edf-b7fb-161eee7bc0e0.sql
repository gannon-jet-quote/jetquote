-- Add email tracking columns to proposals
ALTER TABLE public.proposals
ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN sent_to TEXT DEFAULT NULL,
ADD COLUMN email_subject TEXT DEFAULT NULL;