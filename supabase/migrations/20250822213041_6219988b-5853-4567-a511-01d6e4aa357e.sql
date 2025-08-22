-- Fix function search path security issues
CREATE OR REPLACE FUNCTION cleanup_inactive_members()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.lounge_members 
  WHERE last_seen < now() - interval '5 minutes';
END;
$$;

CREATE OR REPLACE FUNCTION update_member_last_seen(p_lounge_id UUID)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.lounge_members 
  SET last_seen = now() 
  WHERE lounge_id = p_lounge_id AND user_id = auth.uid();
END;
$$;

-- Update RLS policies to require authentication (remove anonymous access)
DROP POLICY IF EXISTS "Lounges are viewable by authenticated users" ON public.cigar_lounges;
DROP POLICY IF EXISTS "Hosts can update their lounges" ON public.cigar_lounges;
DROP POLICY IF EXISTS "Lounge members are viewable by lounge participants" ON public.lounge_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.lounge_members;
DROP POLICY IF EXISTS "Users can leave lounges" ON public.lounge_members;
DROP POLICY IF EXISTS "Chat messages are viewable by lounge participants" ON public.lounge_chat;

-- Recreate policies with proper authentication checks
CREATE POLICY "Authenticated users can view active lounges" 
ON public.cigar_lounges 
FOR SELECT 
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated users can create lounges" 
ON public.cigar_lounges 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their own lounges" 
ON public.cigar_lounges 
FOR UPDATE 
TO authenticated
USING (auth.uid() = host_user_id)
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Lounge participants can view members" 
ON public.lounge_members 
FOR SELECT 
TO authenticated
USING (
  lounge_id IN (
    SELECT lounge_id FROM public.lounge_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can join lounges" 
ON public.lounge_members 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lounge membership" 
ON public.lounge_members 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave lounges they joined" 
ON public.lounge_members 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Lounge participants can view chat messages" 
ON public.lounge_chat 
FOR SELECT 
TO authenticated
USING (
  lounge_id IN (
    SELECT lounge_id FROM public.lounge_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Lounge participants can send chat messages" 
ON public.lounge_chat 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  lounge_id IN (
    SELECT lounge_id FROM public.lounge_members WHERE user_id = auth.uid()
  )
);