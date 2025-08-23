import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfile } from "@/hooks/useProfile";
import { useLoungeChat, ChatMessage } from "@/hooks/useLoungeChat";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Cigarette, Wine, X, Send } from "lucide-react";
import { DrinkingGame } from "./DrinkingGame";
import { CigarGame } from "@/components/studio/CigarGame";
import yakuzaRobotWaitress from "@/assets/yakuza-robot-waitress.jpg";
import yakuzaLoungeBackground from "@/assets/yakuza-lounge-background.jpg";
import type { LoungeMember } from "@/hooks/useCigarLounges";

interface LoungeVisualizerProps {
  members: LoungeMember[];
  currentUserId?: string;
  onCigarClick?: () => void;
  onDrinkClick?: () => void;
  onBartenderClick?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: 'lounge' | 'game' | 'robot') => void;
  onDrinkProgressUpdate?: (progress: number) => void;
  onCigarStatusUpdate?: (status: string, cigarId?: number) => void;
  loungeId?: string | null;
}

const getStatusEmoji = (status: string) => {
  switch (status) {
    case 'selecting': return '🤔';
    case 'cut': return '✂️';
    case 'lit': return '🔥';
    case 'smoking': return '💨';
    case 'finished': return '✅';
    default: return '❓';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'selecting': return 'bg-warrior-leather/20 text-warrior-leather';
    case 'cut': return 'bg-warrior-gold/20 text-warrior-gold';
    case 'lit': return 'bg-warrior-ember/20 text-warrior-ember';
    case 'smoking': return 'bg-warrior-smoke/20 text-warrior-smoke';
    case 'finished': return 'bg-green-500/20 text-green-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getCigarVisual = (member: LoungeMember) => {
  if (!member.selected_cigar_id && member.cigar_status === 'selecting') return null;
  
  switch (member.cigar_status) {
    case 'cut':
      return { emoji: '🚬', status: 'Cut & Ready' };
    case 'lit':
      return { emoji: '🔥', status: 'Lighting' };
    case 'smoking':
      return { emoji: '💨', status: 'Smoking' };
    case 'finished':
      return { emoji: '🚬', status: 'Finished' };
    default:
      return member.selected_cigar_id ? { emoji: '🚬', status: 'Selected' } : null;
  }
};

const getDrinkVisual = (member: LoungeMember) => {
  if (!member.drink_order_id) return null;
  
  const progress = member.drink_progress || 0;
  if (progress >= 100) {
    return { emoji: '🥃', status: 'Empty', opacity: 'opacity-50' };
  } else if (member.drink_status === 'drinking') {
    return { emoji: '🥃', status: `${Math.round(progress)}%`, opacity: 'opacity-100' };
  } else {
    return { emoji: '🥃', status: 'Full', opacity: 'opacity-100' };
  }
};

// Seat positions around a circular table
const seatPositions = [
  { x: 50, y: 20, rotation: 0 },    // Top
  { x: 80, y: 35, rotation: 30 },   // Top Right
  { x: 85, y: 65, rotation: 60 },   // Right
  { x: 65, y: 85, rotation: 120 },  // Bottom Right
  { x: 35, y: 85, rotation: 150 },  // Bottom Left
  { x: 15, y: 65, rotation: 240 },  // Left
];

export const LoungeVisualizer = ({ members, currentUserId, onCigarClick, onDrinkClick, onBartenderClick, activeTab, setActiveTab, onDrinkProgressUpdate, onCigarStatusUpdate, loungeId }: LoungeVisualizerProps) => {
  const { getAvatarUrl } = useProfile();
  const { user } = useAuth();
  const [memberAvatars, setMemberAvatars] = useState<Record<string, string | null>>({});
  const [showDrinkingGame, setShowDrinkingGame] = useState(false);
  const [showCigarGame, setShowCigarGame] = useState(false);
  
  // Chat functionality
  const { messages, sendMessage } = useLoungeChat(loungeId);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchAvatars = async () => {
      const avatars: Record<string, string | null> = {};
      
      for (const member of members) {
        if (member.user_id) {
          try {
            // Fetch the profile to get avatar_id
            const { data: profile } = await supabase
              .from('profiles')
              .select('avatar_id')
              .eq('user_id', member.user_id)
              .single();

            if (profile?.avatar_id) {
              const avatarUrl = await getAvatarUrl(profile.avatar_id);
              avatars[member.user_id] = avatarUrl;
            } else {
              avatars[member.user_id] = null;
            }
          } catch (error) {
            console.error('Error fetching avatar for user:', member.user_id, error);
            avatars[member.user_id] = null;
          }
        }
      }
      
      setMemberAvatars(avatars);
    };

    if (members.length > 0) {
      fetchAvatars();
    }
  }, [members, getAvatarUrl]);

  // Chat message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage("");
  };

  // Find current user's position for floating menu
  const currentUserMember = members.find(m => m.user_id === currentUserId);
  const currentUserIndex = members.findIndex(m => m.user_id === currentUserId);
  const currentUserPosition = currentUserIndex >= 0 ? seatPositions[currentUserIndex] : null;

  if (members.length === 0) {
    return (
      <Card className="warrior-glass border-warrior-gold/20">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">🪑</div>
            <p>The lounge is empty. Be the first to join!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="warrior-glass border-warrior-gold/20 overflow-hidden">
      <CardContent className="p-6">
        <div 
          className="relative w-full rounded-lg overflow-hidden"
          style={{ 
            aspectRatio: '1', 
            minHeight: '400px',
            backgroundImage: `url(${yakuzaLoungeBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay for better contrast */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]"></div>

          {/* Floating Tab Navigation - positioned above current user */}
          {currentUserPosition && setActiveTab && (
            <div 
              className="absolute transform -translate-x-1/2 z-50"
              style={{ 
                left: `${currentUserPosition.x}%`, 
                top: `${Math.max(5, currentUserPosition.y - 25)}%` 
              }}
            >
              <div className="flex space-x-1 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-warrior-gold/30 shadow-2xl">
                <Button
                  variant={activeTab === 'lounge' ? 'warrior' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('lounge')}
                  className="text-xs px-2 py-1"
                >
                  <Users size={12} className="mr-1" />
                  Lounge
                </Button>
                <Button
                  variant={activeTab === 'game' ? 'warrior' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('game')}
                  className="text-xs px-2 py-1"
                >
                  <Cigarette size={12} className="mr-1" />
                  Cigars
                </Button>
                <Button
                  variant={activeTab === 'robot' ? 'warrior' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('robot')}
                  className="text-xs px-2 py-1"
                >
                  <Wine size={12} className="mr-1" />
                  Drinks
                </Button>
              </div>
            </div>
          )}
          
          {/* Central Table */}
          <div 
            className="absolute bg-warrior-leather/40 rounded-full border-2 border-warrior-gold/60 backdrop-blur-sm shadow-2xl"
            style={{
              left: '30%',
              top: '30%',
              width: '40%',
              height: '40%',
            }}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-3xl mb-2 drop-shadow-lg">🎯</div>
                <div className="text-sm text-warrior-gold font-bold drop-shadow-md">Secret Lounge</div>
              </div>
            </div>
          </div>

          {/* Yakuza Robot Bartender */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all z-10"
            style={{ left: '85%', top: '50%' }}
            onClick={onBartenderClick}
            title="Click to order drinks from the bartender"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-3 border-warrior-ember bg-warrior-ember/30 flex items-center justify-center overflow-hidden hover:border-warrior-ember shadow-2xl backdrop-blur-sm transition-all">
                <img 
                  src={yakuzaRobotWaitress} 
                  alt="Yakuza Robot Waitress" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                </div>
              </div>
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 min-w-max">
                <div className="text-center bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-warrior-ember/30">
                  <div className="text-xs font-bold text-warrior-ember drop-shadow-md">Bartender</div>
                  <Badge variant="outline" className="text-xs mt-1 bg-warrior-ember/20 text-warrior-ember border-warrior-ember/50">
                    Ready to Serve
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Member Seats */}
          {members.slice(0, 6).map((member, index) => {
            const position = seatPositions[index];
            const isCurrentUser = member.user_id === currentUserId;
            const avatar = memberAvatars[member.user_id];

            return (
              <div
                key={member.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
              >
                {/* Seat */}
                <div className="relative">
                  <div 
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden shadow-2xl backdrop-blur-sm ${
                      isCurrentUser 
                        ? 'border-warrior-gold bg-warrior-gold/30' 
                        : 'border-warrior-leather/70 bg-warrior-leather/20'
                    }`}
                  >
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt={member.handle || 'Member'} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-warrior-leather/40 flex items-center justify-center text-warrior-gold text-lg font-bold drop-shadow-lg">
                        {(member.handle || 'A')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Cigar Item */}
                  {(() => {
                    const cigar = getCigarVisual(member);
                    if (!cigar) return null;
                    const isClickable = isCurrentUser && onCigarClick;
                    return (
                      <div 
                        className={`absolute -right-6 top-2 bg-warrior-leather/90 rounded-full p-1 border border-warrior-gold/50 shadow-lg backdrop-blur-sm ${
                          isClickable ? 'cursor-pointer hover:bg-warrior-leather hover:scale-110 transition-all z-20' : ''
                        }`}
                        title={isClickable ? `Click to ${cigar.status === 'Smoking' ? 'continue smoking' : 'manage cigar'}` : `Cigar: ${cigar.status}`}
                        onClick={isClickable ? () => setShowCigarGame(true) : undefined}
                      >
                        <span className="text-sm drop-shadow-md">{cigar.emoji}</span>
                      </div>
                    );
                  })()}

                  {/* Drink Item */}
                  {(() => {
                    const drink = getDrinkVisual(member);
                    if (!drink) return null;
                    const isClickable = isCurrentUser && onDrinkClick;
                    return (
                      <div 
                        className={`absolute -left-6 top-2 bg-warrior-leather/90 rounded-full p-1 border border-warrior-gold/50 shadow-lg backdrop-blur-sm ${drink.opacity} ${
                          isClickable ? 'cursor-pointer hover:bg-warrior-leather hover:scale-110 transition-all z-20' : ''
                        }`}
                        title={isClickable ? `Click to ${drink.status === 'Empty' ? 'order new drink' : 'continue drinking'}` : `Drink: ${drink.status}`}
                        onClick={isClickable ? () => setShowDrinkingGame(true) : undefined}
                      >
                        <span className="text-sm drop-shadow-md">{drink.emoji}</span>
                      </div>
                    );
                  })()}

                  {/* Status Indicator */}
                  <div className="absolute -top-2 -right-2">
                    <div className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-sm shadow-xl backdrop-blur-sm ${getStatusColor(member.cigar_status)}`}>
                      <span className="drop-shadow-md">{getStatusEmoji(member.cigar_status)}</span>
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 min-w-max">
                    <div className="text-center bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-warrior-gold/30 shadow-xl">
                      <div className={`text-sm font-bold drop-shadow-md ${isCurrentUser ? 'text-warrior-gold' : 'text-foreground'}`}>
                        {isCurrentUser ? 'You' : (member.handle || 'Anonymous')}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${getStatusColor(member.cigar_status)} border-opacity-70`}
                      >
                        {member.cigar_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Overflow indicator */}
          {members.length > 6 && (
            <div className="absolute bottom-4 right-4">
              <Badge variant="outline" className="text-xs">
                +{members.length - 6} more
              </Badge>
            </div>
          )}

          {/* Floating Chat Messages - left side */}
          {messages.length > 0 && (
            <div className="absolute left-4 top-4 bottom-20 w-72 z-40">
              <div className="bg-black/20 backdrop-blur-md rounded-lg border border-warrior-gold/30 shadow-2xl h-full flex flex-col">
                <div className="p-3 border-b border-warrior-gold/20">
                  <h3 className="text-sm font-bold text-warrior-gold">Lounge Chat</h3>
                </div>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {messages.slice(-10).map((message) => (
                      <div key={message.id} className={`max-w-[85%] ${message.user_id === user?.id ? 'ml-auto' : 'mr-auto'}`}>
                        <div className={`rounded-lg p-2 text-xs ${
                          message.user_id === user?.id 
                            ? 'bg-warrior-gold/20 text-foreground' 
                            : 'bg-warrior-leather/30 text-foreground'
                        }`}>
                          {message.user_id !== user?.id && (
                            <div className="text-xs text-warrior-gold mb-1 font-medium">
                              {message.handle || 'Anonymous'}
                            </div>
                          )}
                          <div>{message.message}</div>
                          <div className="text-xs text-muted-foreground mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Chat Input - bottom of screen */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md z-40">
            <form onSubmit={handleSendMessage} className="bg-black/80 backdrop-blur-md rounded-lg border border-warrior-gold/30 shadow-2xl p-3">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-warrior-leather/20 border-warrior-gold/30 text-foreground placeholder:text-muted-foreground text-sm"
                  maxLength={200}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="warrior"
                  disabled={!newMessage.trim()}
                  className="px-3"
                >
                  <Send size={14} />
                </Button>
              </div>
            </form>
          </div>
          {showCigarGame && currentUserPosition && currentUserMember && (
            <div 
              className="absolute transform -translate-x-1/2 z-50"
              style={{ 
                left: `${currentUserPosition.x}%`, 
                top: currentUserPosition.y > 70 
                  ? `${Math.max(5, currentUserPosition.y - 55)}%`  // Show above for bottom seats
                  : `${Math.min(65, currentUserPosition.y + 25)}%`  // Show below for top seats
              }}
            >
              <div className="bg-black/90 backdrop-blur-md rounded-lg border border-warrior-gold/30 shadow-2xl p-4 min-w-[320px] max-w-[400px]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-warrior-gold">Cigar Experience</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCigarGame(false)}
                    className="h-6 w-6 p-0 text-warrior-gold hover:text-warrior-ember"
                  >
                    <X size={14} />
                  </Button>
                </div>
                <div className="scale-90 origin-top">
                  <CigarGame
                    currentStatus={currentUserMember.cigar_status}
                    onStatusChange={(status, cigarId) => {
                      if (onCigarStatusUpdate) {
                        onCigarStatusUpdate(status, cigarId);
                      }
                    }}
                    selectedCigarId={currentUserMember.selected_cigar_id || undefined}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Floating Drinking Game - positioned near current user */}
          {showDrinkingGame && currentUserPosition && currentUserMember?.drink_order_id && (
            <div 
              className="absolute transform -translate-x-1/2 z-50"
              style={{ 
                left: `${currentUserPosition.x}%`, 
                top: currentUserPosition.y > 70 
                  ? `${Math.max(5, currentUserPosition.y - 45)}%`  // Show above for bottom seats
                  : `${Math.min(75, currentUserPosition.y + 25)}%`  // Show below for top seats
              }}
            >
              <div className="bg-black/90 backdrop-blur-md rounded-lg border border-warrior-gold/30 shadow-2xl p-4 min-w-[300px]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-warrior-gold">Drinking Experience</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDrinkingGame(false)}
                    className="h-6 w-6 p-0 text-warrior-gold hover:text-warrior-ember"
                  >
                    <X size={14} />
                  </Button>
                </div>
                <DrinkingGame
                  drinkName={`Drink #${currentUserMember.drink_order_id}`}
                  drinkDifficulty="medium"
                  drinkProgress={currentUserMember.drink_progress || 0}
                  onProgressUpdate={(progress) => {
                    if (onDrinkProgressUpdate) {
                      onDrinkProgressUpdate(progress);
                    }
                  }}
                  onFinished={() => {
                    if (onDrinkProgressUpdate) {
                      onDrinkProgressUpdate(100);
                    }
                    setShowDrinkingGame(false);
                  }}
                  isActive={!!currentUserMember.drink_order_id}
                />
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-warrior-gold/20">
          <div className="flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex flex-col items-center space-y-1">
              <span className="text-muted-foreground font-medium">Cigar Status</span>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-1">
                  <span>🤔</span>
                  <span className="text-muted-foreground">Selecting</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>✂️</span>
                  <span className="text-muted-foreground">Cutting</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🔥</span>
                  <span className="text-muted-foreground">Lighting</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>💨</span>
                  <span className="text-muted-foreground">Smoking</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>✅</span>
                  <span className="text-muted-foreground">Finished</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="text-muted-foreground font-medium">Table Items</span>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-1">
                  <span>🚬</span>
                  <span className="text-muted-foreground">Cigar</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🥃</span>
                  <span className="text-muted-foreground">Drink</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};