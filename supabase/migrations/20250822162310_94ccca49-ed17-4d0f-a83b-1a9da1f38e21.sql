-- Fix security issue: Set proper search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix security issue: Set proper search_path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, handle)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'handle', 'warrior_' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$;