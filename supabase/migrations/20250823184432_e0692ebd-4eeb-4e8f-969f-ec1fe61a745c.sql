-- Create a cooking_sessions table to track complete kitchen sessions
CREATE TABLE public.cooking_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cut_type text NOT NULL,
  cut_name text NOT NULL,
  searing_score integer NOT NULL DEFAULT 0,
  searing_technique text,
  slicing_score integer NOT NULL DEFAULT 0,
  total_cuts integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cooking_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cooking sessions"
ON public.cooking_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cooking sessions"
ON public.cooking_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update profile stats when cooking session is completed
CREATE OR REPLACE FUNCTION public.update_profile_cooking_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update the profile stats
  UPDATE public.profiles 
  SET 
    sear_score = sear_score + NEW.searing_score,
    marbling_points = marbling_points + NEW.slicing_score,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically update profile stats
CREATE TRIGGER update_cooking_stats_trigger
AFTER INSERT ON public.cooking_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_cooking_stats();