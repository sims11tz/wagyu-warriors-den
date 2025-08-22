-- Fix function search path issues
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.verify_user_age(birth_date date)
RETURNS boolean AS $$
BEGIN
  RETURN (CURRENT_DATE - birth_date) >= INTERVAL '21 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Fix anonymous access policies by restricting to authenticated users only
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;
CREATE POLICY "Events are viewable by authenticated users" 
ON public.events 
FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can view their own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can view their own RSVPs" 
ON public.event_rsvps 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can insert their own RSVPs" 
ON public.event_rsvps 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can update their own RSVPs" 
ON public.event_rsvps 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public_profile = true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);