import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import yakuzaRobotWaitress from "@/assets/yakuza-robot-waitress.jpg";
import type { LoungeMember } from "@/hooks/useCigarLounges";

interface LoungeVisualizerProps {
  members: LoungeMember[];
  currentUserId?: string;
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
      return { emoji: '🏁', status: 'Finished' };
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

export const LoungeVisualizer = ({ members, currentUserId }: LoungeVisualizerProps) => {
  const { getAvatarUrl } = useProfile();
  const [memberAvatars, setMemberAvatars] = useState<Record<string, string | null>>({});

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
    <Card className="warrior-glass border-warrior-gold/20">
      <CardContent className="p-6">
        <div className="relative w-full" style={{ aspectRatio: '1', minHeight: '300px' }}>
          {/* Central Table */}
          <div 
            className="absolute bg-warrior-leather/30 rounded-full border-2 border-warrior-gold/40"
            style={{
              left: '30%',
              top: '30%',
              width: '40%',
              height: '40%',
            }}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-warrior-gold font-medium">Lounge</div>
              </div>
            </div>
          </div>

          {/* Yakuza Robot Bartender */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: '85%', top: '50%' }}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-warrior-ember bg-warrior-ember/20 flex items-center justify-center overflow-hidden">
                <img 
                  src={yakuzaRobotWaitress} 
                  alt="Yakuza Robot Waitress" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 rounded-full bg-green-500 border border-background flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                </div>
              </div>
              <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 min-w-max">
                <div className="text-center">
                  <div className="text-xs font-medium text-warrior-ember">Bartender</div>
                  <Badge variant="outline" className="text-xs mt-1 bg-warrior-ember/10 text-warrior-ember">
                    Online
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
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
              >
                {/* Seat */}
                <div className="relative">
                  <div 
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden ${
                      isCurrentUser 
                        ? 'border-warrior-gold bg-warrior-gold/20' 
                        : 'border-warrior-leather/50 bg-warrior-leather/10'
                    }`}
                  >
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt={member.handle || 'Member'} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-warrior-leather/30 flex items-center justify-center text-warrior-gold text-lg font-bold">
                        {(member.handle || 'A')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Cigar Item */}
                  {(() => {
                    const cigar = getCigarVisual(member);
                    if (!cigar) return null;
                    return (
                      <div 
                        className="absolute -right-6 top-2 bg-warrior-leather/80 rounded-full p-1 border border-warrior-gold/30"
                        title={`Cigar: ${cigar.status}`}
                      >
                        <span className="text-sm">{cigar.emoji}</span>
                      </div>
                    );
                  })()}

                  {/* Drink Item */}
                  {(() => {
                    const drink = getDrinkVisual(member);
                    if (!drink) return null;
                    return (
                      <div 
                        className={`absolute -left-6 top-2 bg-warrior-leather/80 rounded-full p-1 border border-warrior-gold/30 ${drink.opacity}`}
                        title={`Drink: ${drink.status}`}
                      >
                        <span className="text-sm">{drink.emoji}</span>
                      </div>
                    );
                  })()}

                  {/* Status Indicator */}
                  <div className="absolute -top-2 -right-2">
                    <div className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-sm ${getStatusColor(member.cigar_status)}`}>
                      {getStatusEmoji(member.cigar_status)}
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 min-w-max">
                    <div className="text-center">
                      <div className={`text-xs font-medium ${isCurrentUser ? 'text-warrior-gold' : 'text-foreground'}`}>
                        {isCurrentUser ? 'You' : (member.handle || 'Anonymous')}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${getStatusColor(member.cigar_status)}`}
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