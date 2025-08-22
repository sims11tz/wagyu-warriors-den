import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  handle: string | null;
  bio: string | null;
  age_verified: boolean;
  public_profile: boolean;
  tier: string;
  avatar_url: string | null;
  avatar_id: string | null;
  sear_score: number;
  marbling_points: number;
  smoke_rings: number;
  favorites: any;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          setError(error.message);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: 'No user or profile found' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      setProfile({ ...profile, ...updates });
      return { error: null };
    } catch (err) {
      return { error: 'Failed to update profile' };
    }
  };

  const getAvatarUrl = async (avatarId: string) => {
    if (!avatarId) return null;
    
    try {
      const { data } = await supabase
        .from('avatar_options')
        .select('image_url')
        .eq('id', avatarId)
        .single();
      
      return data?.image_url || null;
    } catch {
      return null;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    getAvatarUrl,
  };
};