-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE,
  bio TEXT,
  tier TEXT DEFAULT 'guest' CHECK (tier IN ('guest', 'member', 'founding')),
  avatar_url TEXT,
  favorites JSONB DEFAULT '{}',
  marbling_points INTEGER DEFAULT 0,
  sear_score INTEGER DEFAULT 0,
  smoke_rings INTEGER DEFAULT 0,
  age_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, handle)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'handle', 'warrior_' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT,
  dress_code TEXT,
  menu_highlights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events are viewable by authenticated users
CREATE POLICY "Events are viewable by authenticated users"
ON public.events
FOR SELECT
TO authenticated
USING (true);

-- Create event RSVPs table
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'no')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS for event RSVPs
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own RSVPs
CREATE POLICY "Users can view their own RSVPs"
ON public.event_rsvps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own RSVPs"
ON public.event_rsvps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVPs"
ON public.event_rsvps
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for RSVP timestamps
CREATE TRIGGER update_event_rsvps_updated_at
BEFORE UPDATE ON public.event_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample event
INSERT INTO public.events (title, description, starts_at, ends_at, venue, dress_code, menu_highlights)
VALUES (
  'Founding Warriors Tasting',
  'An exclusive tasting event for our founding members featuring A5 Wagyu from the finest Japanese prefectures.',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
  'The Wagyu Warriors Private Dining Room',
  'Smart Casual - Dark Colors Preferred',
  ARRAY['A5 Miyazaki Ribeye', 'Hokkaido Snow Beef', 'Sake Pairing', 'Whisky Flight']
);