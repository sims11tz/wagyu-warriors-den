-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add avatar_id field to profiles to reference the selected avatar
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT NULL;

-- Create a table to store the generated avatar options
CREATE TABLE IF NOT EXISTS public.avatar_options (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  age_group TEXT CHECK (age_group IN ('young', 'middle', 'old')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on avatar_options
ALTER TABLE public.avatar_options ENABLE ROW LEVEL SECURITY;

-- Create policy for avatar_options (publicly readable)
CREATE POLICY "Avatar options are viewable by authenticated users" 
ON public.avatar_options 
FOR SELECT 
TO authenticated
USING (true);