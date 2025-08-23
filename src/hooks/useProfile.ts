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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  const fetchAvatarUrl = async (avatarId: string) => {
    if (!avatarId) {
      setAvatarUrl(null);
      return null;
    }
    
    try {
      const { data } = await supabase
        .from('avatar_options')
        .select('image_url')
        .eq('id', avatarId)
        .maybeSingle();
      
      const url = data?.image_url || null;
      setAvatarUrl(url);
      return url;
    } catch (error) {
      console.error('Error fetching avatar URL:', error);
      setAvatarUrl(null);
      return null;
    }
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setAvatarUrl(null);
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
          // Fetch avatar URL if profile has avatar_id
          if (data?.avatar_id) {
            await fetchAvatarUrl(data.avatar_id);
          } else {
            setAvatarUrl(null);
          }
        }
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, refreshKey]);

  // Update avatar URL when avatar_id changes
  useEffect(() => {
    if (profile?.avatar_id) {
      fetchAvatarUrl(profile.avatar_id);
    } else {
      setAvatarUrl(null);
    }
  }, [profile?.avatar_id]);

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

      // Update local state immediately
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      
      // If avatar_id was updated, fetch new avatar URL immediately
      if (updates.avatar_id !== undefined) {
        if (updates.avatar_id) {
          await fetchAvatarUrl(updates.avatar_id);
        } else {
          setAvatarUrl(null);
        }
      }
      
      // Force a refresh to ensure UI updates
      setRefreshKey(prev => prev + 1);
      
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
        .maybeSingle();
      
      return data?.image_url || null;
    } catch (error) {
      console.error('Error fetching avatar URL:', error);
      return null;
    }
  };

  const refreshProfile = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    profile,
    loading,
    error,
    avatarUrl, // Expose current avatar URL
    updateProfile,
    getAvatarUrl,
    fetchAvatarUrl, // Expose function to manually fetch avatar URL
    refreshProfile, // Function to refresh profile data
  };
};