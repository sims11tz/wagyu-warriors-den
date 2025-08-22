import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
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
          // For now, we'll use a placeholder since we need the avatar_id from profiles
          avatars[member.user_id] = null;
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
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCurrentUser 
                        ? 'border-warrior-gold bg-warrior-gold/20' 
                        : 'border-warrior-leather/50 bg-warrior-leather/10'
                    }`}
                  >
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt={member.handle || 'Member'} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-warrior-leather/30 flex items-center justify-center text-warrior-gold text-lg font-bold">
                        {(member.handle || 'A')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

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
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex items-center space-x-1 text-xs">
              <span>🤔</span>
              <span className="text-muted-foreground">Selecting</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <span>✂️</span>
              <span className="text-muted-foreground">Cutting</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <span>🔥</span>
              <span className="text-muted-foreground">Lighting</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <span>💨</span>
              <span className="text-muted-foreground">Smoking</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <span>✅</span>
              <span className="text-muted-foreground">Finished</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};