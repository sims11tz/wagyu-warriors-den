import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface CigarLounge {
  id: string;
  name: string;
  host_user_id: string;
  max_members: number;
  created_at: string;
  is_active: boolean;
  member_count: number;
  host_handle?: string;
}

export interface LoungeMember {
  id: string;
  lounge_id: string;
  user_id: string;
  selected_cigar_id?: number;
  cigar_status: 'selecting' | 'cut' | 'lit' | 'smoking' | 'finished';
  joined_at: string;
  last_seen: string;
  handle?: string;
}

export const useCigarLounges = () => {
  const [lounges, setLounges] = useState<CigarLounge[]>([]);
  const [currentLounge, setCurrentLounge] = useState<CigarLounge | null>(null);
  const [members, setMembers] = useState<LoungeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch lounges with member counts
  const fetchLounges = async () => {
    try {
      // First get lounges
      const { data: loungesData, error: loungesError } = await supabase
        .from('cigar_lounges')
        .select('*')
        .eq('is_active', true);

      if (loungesError) throw loungesError;

      // Get member counts and host handles
      const loungesWithCounts = await Promise.all(
        (loungesData || []).map(async (lounge) => {
          // Get member count
          const { count } = await supabase
            .from('lounge_members')
            .select('*', { count: 'exact', head: true })
            .eq('lounge_id', lounge.id);

          // Get host handle
          const { data: hostProfile } = await supabase
            .from('profiles')
            .select('handle')
            .eq('user_id', lounge.host_user_id)
            .single();

          return {
            ...lounge,
            member_count: count || 0,
            host_handle: hostProfile?.handle || 'Unknown Host'
          };
        })
      );

      setLounges(loungesWithCounts);
    } catch (error) {
      console.error('Error fetching lounges:', error);
      toast({
        title: "Error",
        description: "Failed to load lounges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Join a lounge
  const joinLounge = async (loungeId: string) => {
    if (!user) return;

    try {
      // First, leave any current lounge
      await leaveCurrentLounge();

      // Join the new lounge
      const { error } = await supabase
        .from('lounge_members')
        .insert({
          lounge_id: loungeId,
          user_id: user.id,
          cigar_status: 'selecting'
        });

      if (error) throw error;

      // Set current lounge
      const lounge = lounges.find(l => l.id === loungeId);
      if (lounge) {
        setCurrentLounge(lounge);
        toast({
          title: "Joined Lounge",
          description: `Welcome to ${lounge.name}!`
        });
      }

      // Refresh lounges to update member counts
      fetchLounges();
    } catch (error: any) {
      console.error('Error joining lounge:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join lounge",
        variant: "destructive"
      });
    }
  };

  // Leave current lounge
  const leaveCurrentLounge = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lounge_members')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentLounge(null);
      setMembers([]);
    } catch (error) {
      console.error('Error leaving lounge:', error);
    }
  };

  // Create a new lounge
  const createLounge = async (name: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cigar_lounges')
        .insert({
          name,
          host_user_id: user.id,
          max_members: 6
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the created lounge
      await joinLounge(data.id);

      toast({
        title: "Lounge Created",
        description: `${name} is now open for smoking!`
      });
    } catch (error: any) {
      console.error('Error creating lounge:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create lounge",
        variant: "destructive"
      });
    }
  };

  // Update cigar status
  const updateCigarStatus = async (status: LoungeMember['cigar_status'], cigarId?: number) => {
    if (!user || !currentLounge) return;

    try {
      const { error } = await supabase
        .from('lounge_members')
        .update({
          cigar_status: status,
          ...(cigarId && { selected_cigar_id: cigarId }),
          last_seen: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('lounge_id', currentLounge.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating cigar status:', error);
    }
  };

  // Fetch current lounge members
  const fetchMembers = async () => {
    if (!currentLounge) return;

    try {
      const { data: membersData, error } = await supabase
        .from('lounge_members')
        .select('*')
        .eq('lounge_id', currentLounge.id);

      if (error) throw error;

      // Get handles for each member
      const membersWithHandles = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('handle')
            .eq('user_id', member.user_id)
            .single();

          return {
            ...member,
            handle: profile?.handle || 'Anonymous Warrior',
            cigar_status: member.cigar_status as LoungeMember['cigar_status']
          };
        })
      );

      setMembers(membersWithHandles);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Check if user is in a lounge
  const checkCurrentLounge = async () => {
    if (!user) return;

    try {
      const { data: memberData, error } = await supabase
        .from('lounge_members')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (memberData) {
        // Get the lounge details
        const { data: loungeData } = await supabase
          .from('cigar_lounges')
          .select('*')
          .eq('id', memberData.lounge_id)
          .single();

        if (loungeData) {
          setCurrentLounge({
            ...loungeData,
            member_count: 0, // Will be updated by fetchMembers
            host_handle: 'Host'
          });
        }
      }
    } catch (error) {
      console.error('Error checking current lounge:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to lounge changes
    const loungeSubscription = supabase
      .channel('lounge-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cigar_lounges' },
        () => fetchLounges()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lounge_members' },
        () => {
          fetchLounges();
          if (currentLounge) fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(loungeSubscription);
    };
  }, [user, currentLounge]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchLounges();
      checkCurrentLounge();
    }
  }, [user]);

  // Fetch members when lounge changes
  useEffect(() => {
    if (currentLounge) {
      fetchMembers();
    }
  }, [currentLounge]);

  // Update last seen periodically
  useEffect(() => {
    if (!currentLounge || !user) return;

    const interval = setInterval(async () => {
      try {
        await supabase.rpc('update_member_last_seen', {
          p_lounge_id: currentLounge.id
        });
      } catch (error) {
        console.error('Error updating last seen:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentLounge, user]);

  return {
    lounges,
    currentLounge,
    members,
    loading,
    joinLounge,
    leaveCurrentLounge,
    createLounge,
    updateCigarStatus,
    fetchLounges
  };
};