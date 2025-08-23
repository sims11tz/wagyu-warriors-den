-- Create function to update smoke rings when user smokes cigars
CREATE OR REPLACE FUNCTION public.update_smoke_rings(p_user_id uuid, p_rings integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update the profile stats
  UPDATE public.profiles 
  SET 
    smoke_rings = smoke_rings + p_rings,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$function$;