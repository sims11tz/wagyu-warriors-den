-- Fix the verify_user_age function to properly calculate age
CREATE OR REPLACE FUNCTION public.verify_user_age(birth_date date)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN AGE(CURRENT_DATE, birth_date) >= INTERVAL '21 years';
END;
$function$