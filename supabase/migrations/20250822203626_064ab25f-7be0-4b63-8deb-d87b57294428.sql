-- Create cigar lounges table
CREATE TABLE public.cigar_lounges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host_user_id UUID NOT NULL,
  max_members INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.cigar_lounges ENABLE ROW LEVEL SECURITY;

-- RLS policies for cigar lounges
CREATE POLICY "Lounges are viewable by authenticated users" 
ON public.cigar_lounges 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create lounges" 
ON public.cigar_lounges 
FOR INSERT 
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their lounges" 
ON public.cigar_lounges 
FOR UPDATE 
USING (auth.uid() = host_user_id);

-- Create lounge members table for tracking who's in each lounge
CREATE TABLE public.lounge_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lounge_id UUID NOT NULL REFERENCES public.cigar_lounges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_cigar_id INTEGER,
  cigar_status TEXT DEFAULT 'selecting', -- selecting, cut, lit, smoking, finished
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lounge_id, user_id)
);

-- Enable RLS
ALTER TABLE public.lounge_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for lounge members
CREATE POLICY "Lounge members are viewable by lounge participants" 
ON public.lounge_members 
FOR SELECT 
USING (
  lounge_id IN (
    SELECT lounge_id FROM public.lounge_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join lounges" 
ON public.lounge_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" 
ON public.lounge_members 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave lounges" 
ON public.lounge_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create lounge chat table
CREATE TABLE public.lounge_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lounge_id UUID NOT NULL REFERENCES public.cigar_lounges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat', -- chat, action, system
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lounge_chat ENABLE ROW LEVEL SECURITY;

-- RLS policies for lounge chat
CREATE POLICY "Chat messages are viewable by lounge participants" 
ON public.lounge_chat 
FOR SELECT 
USING (
  lounge_id IN (
    SELECT lounge_id FROM public.lounge_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their lounges" 
ON public.lounge_chat 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  lounge_id IN (
    SELECT lounge_id FROM public.lounge_members WHERE user_id = auth.uid()
  )
);

-- Enable realtime for all tables
ALTER TABLE public.cigar_lounges REPLICA IDENTITY FULL;
ALTER TABLE public.lounge_members REPLICA IDENTITY FULL;
ALTER TABLE public.lounge_chat REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.cigar_lounges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lounge_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lounge_chat;

-- Function to clean up inactive members (haven't been seen in 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_inactive_members()
RETURNS void AS $$
BEGIN
  DELETE FROM public.lounge_members 
  WHERE last_seen < now() - interval '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to update last seen timestamp
CREATE OR REPLACE FUNCTION update_member_last_seen(p_lounge_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.lounge_members 
  SET last_seen = now() 
  WHERE lounge_id = p_lounge_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;