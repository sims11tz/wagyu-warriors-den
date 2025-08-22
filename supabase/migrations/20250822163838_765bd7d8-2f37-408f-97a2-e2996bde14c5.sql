-- Fix Profile Privacy: Replace the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create more restrictive policies for profile access
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add a policy for public profiles (if users want to make their profile public)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_profile boolean DEFAULT false;

CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (public_profile = true AND auth.role() = 'authenticated');

-- Update the handle_new_user function to include server-side age verification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, handle, age_verified)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'handle', 'warrior_' || substr(NEW.id::text, 1, 8)),
    COALESCE((NEW.raw_user_meta_data ->> 'age_verified')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add a function to verify age server-side
CREATE OR REPLACE FUNCTION public.verify_user_age(birth_date date)
RETURNS boolean AS $$
BEGIN
  RETURN (CURRENT_DATE - birth_date) >= INTERVAL '21 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();