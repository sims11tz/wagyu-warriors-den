import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  lounge_id: string;
  user_id: string;
  message: string;
  message_type: 'chat' | 'action' | 'system';
  created_at: string;
  handle?: string;
}

export const useLoungeChat = (loungeId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch chat messages
  const fetchMessages = async () => {
    if (!loungeId) return;

    setLoading(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('lounge_chat')
        .select('*')
        .eq('lounge_id', loungeId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      // Get handles for each message
      const messagesWithHandles = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('handle')
            .eq('user_id', message.user_id)
            .single();

          return {
            ...message,
            message_type: message.message_type as ChatMessage['message_type'],
            handle: profile?.handle || 'Anonymous Warrior'
          };
        })
      );

      setMessages(messagesWithHandles);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a chat message
  const sendMessage = async (message: string, type: ChatMessage['message_type'] = 'chat') => {
    if (!loungeId || !user || !message.trim()) return;

    try {
      const { error } = await supabase
        .from('lounge_chat')
        .insert({
          lounge_id: loungeId,
          user_id: user.id,
          message: message.trim(),
          message_type: type
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Send an action message (like "cut their cigar")
  const sendActionMessage = async (action: string) => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('handle')
      .eq('user_id', user.id)
      .single();

    const handle = profile?.handle || 'Anonymous Warrior';
    await sendMessage(`${handle} ${action}`, 'action');
  };

  // Set up real-time subscription for chat
  useEffect(() => {
    if (!loungeId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    // Subscribe to new messages
    const chatSubscription = supabase
      .channel(`lounge-chat-${loungeId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'lounge_chat',
          filter: `lounge_id=eq.${loungeId}`
        },
        async (payload) => {
          // Get the sender's handle
          const { data: profile } = await supabase
            .from('profiles')
            .select('handle')
            .eq('user_id', payload.new.user_id)
            .single();

          const newMessage: ChatMessage = {
            ...payload.new as any,
            handle: profile?.handle || 'Anonymous Warrior'
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatSubscription);
    };
  }, [loungeId]);

  return {
    messages,
    loading,
    sendMessage,
    sendActionMessage
  };
};