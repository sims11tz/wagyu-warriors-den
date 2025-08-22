import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { useLoungeChat, ChatMessage } from "@/hooks/useLoungeChat";
import { useAuth } from "@/contexts/AuthContext";

interface LoungeChatProps {
  loungeId: string | null;
  isVisible: boolean;
  onToggle: () => void;
}

export const LoungeChat: React.FC<LoungeChatProps> = ({ loungeId, isVisible, onToggle }) => {
  const [newMessage, setNewMessage] = useState("");
  const { messages, sendMessage } = useLoungeChat(loungeId);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage("");
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="fixed bottom-20 right-4 z-10"
      >
        <MessageCircle size={16} />
        Chat
      </Button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 warrior-glass border border-warrior-gold/20 rounded-xl flex flex-col z-10">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-warrior-gold/20">
        <h3 className="font-semibold text-foreground">Lounge Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.user_id === user?.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-warrior-gold/20">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-warrior-leather/20 border-warrior-gold/30"
            maxLength={200}
          />
          <Button
            type="submit"
            size="sm"
            variant="warrior"
            disabled={!newMessage.trim()}
          >
            <Send size={14} />
          </Button>
        </div>
      </form>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const getMessageStyle = () => {
    switch (message.message_type) {
      case 'action':
        return "text-warrior-ember italic text-sm";
      case 'system':
        return "text-muted-foreground text-xs text-center";
      default:
        return isOwn 
          ? "bg-warrior-gold/20 text-foreground ml-auto" 
          : "bg-warrior-leather/30 text-foreground";
    }
  };

  if (message.message_type === 'system') {
    return (
      <div className="text-center">
        <span className="text-xs text-muted-foreground">{message.message}</span>
      </div>
    );
  }

  if (message.message_type === 'action') {
    return (
      <div className="text-center">
        <span className="text-sm text-warrior-ember italic">
          {message.message}
        </span>
      </div>
    );
  }

  return (
    <div className={`max-w-[80%] ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`rounded-lg p-2 ${getMessageStyle()}`}>
        {!isOwn && (
          <div className="text-xs text-muted-foreground mb-1">
            {message.handle}
          </div>
        )}
        <div className="text-sm">{message.message}</div>
        <div className="text-xs text-muted-foreground mt-1 opacity-70">
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};