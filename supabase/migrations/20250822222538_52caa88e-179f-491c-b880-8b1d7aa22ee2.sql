-- Create security definer function to check lounge membership (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_lounge_member(p_lounge_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.lounge_members 
    WHERE lounge_id = p_lounge_id AND user_id = p_user_id
  );
END;
$function$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Lounge participants can view members" ON public.lounge_members;
DROP POLICY IF EXISTS "Lounge participants can view chat messages" ON public.lounge_chat;
DROP POLICY IF EXISTS "Users can send messages to their lounges" ON public.lounge_chat;
DROP POLICY IF EXISTS "Lounge participants can send chat messages" ON public.lounge_chat;

-- Create new policies using the security definer function
CREATE POLICY "Lounge members can view other members" 
ON public.lounge_members 
FOR SELECT 
USING (public.is_lounge_member(lounge_id, auth.uid()));

CREATE POLICY "Lounge members can view chat messages" 
ON public.lounge_chat 
FOR SELECT 
USING (public.is_lounge_member(lounge_id, auth.uid()));

CREATE POLICY "Lounge members can send chat messages" 
ON public.lounge_chat 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  public.is_lounge_member(lounge_id, auth.uid())
);

-- Add constraint to prevent duplicate memberships (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lounge_members_lounge_id_user_id_key'
  ) THEN
    ALTER TABLE public.lounge_members 
    ADD CONSTRAINT lounge_members_lounge_id_user_id_key 
    UNIQUE (lounge_id, user_id);
  END IF;
END $$;

-- Function to automatically add host as member when lounge is created
CREATE OR REPLACE FUNCTION public.add_host_as_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.lounge_members (lounge_id, user_id, cigar_status)
  VALUES (NEW.id, NEW.host_user_id, 'selecting')
  ON CONFLICT (lounge_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically add host as member
DROP TRIGGER IF EXISTS on_lounge_created ON public.cigar_lounges;
CREATE TRIGGER on_lounge_created
  AFTER INSERT ON public.cigar_lounges
  FOR EACH ROW
  EXECUTE FUNCTION public.add_host_as_member();