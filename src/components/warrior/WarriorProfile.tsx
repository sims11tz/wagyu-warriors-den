import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import { Flame, Target, Cigarette, Edit, Trophy, Star } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface WarriorProfileProps {
  onEditProfile: () => void;
}

export const WarriorProfile: React.FC<WarriorProfileProps> = ({ onEditProfile }) => {
  const { profile, loading, error, getAvatarUrl } = useProfile();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Update avatar URL whenever avatar_id changes
  useEffect(() => {
    const updateAvatarUrl = async () => {
      if (profile?.avatar_id) {
        const url = await getAvatarUrl(profile.avatar_id);
        setAvatarUrl(url);
      } else {
        setAvatarUrl(null);
      }
    };
    
    updateAvatarUrl();
  }, [profile?.avatar_id, getAvatarUrl]);

  if (loading) {
    return (
      <div className="space-y-6 pb-24">
        {/* Loading skeleton */}
        <div className="warrior-gradient-leather rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6 pb-24">
        <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20 text-center">
          <p className="text-warrior-light">Failed to load profile. Please try again.</p>
          <Button variant="warrior" onClick={() => window.location.reload()} className="mt-4">
            Reload
          </Button>
        </div>
      </div>
    );
  }

  // These will update immediately when profile changes
  const displayHandle = profile.handle || 'New Warrior';
  const displayBio = profile.bio || 'A fresh warrior ready to master the art of beef.';
  const tierName = profile.tier === 'guest' ? 'New Warrior' : 
                  profile.tier === 'member' ? 'Active Warrior' : 'Founding Warrior';

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Profile Section */}
      <div className="relative warrior-gradient-leather rounded-2xl p-6 warrior-shadow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warrior-gold/10 to-transparent" />
        <div className="relative flex items-start space-x-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayHandle}
                className="w-20 h-20 rounded-full object-cover border-3 border-warrior-gold warrior-shadow-gold"
                key={avatarUrl} // Force re-render when avatar changes
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-warrior-gold/20 border-3 border-warrior-gold warrior-shadow-gold flex items-center justify-center">
                <span className="text-2xl font-bold text-warrior-gold">
                  {displayHandle.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-warrior-gold rounded-full">
              <Star size={12} className="text-warrior-dark" fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">{displayHandle}</h1>
                <Badge variant="outline" className="border-warrior-gold text-warrior-gold bg-warrior-gold/10 mt-1">
                  <Trophy size={12} className="mr-1" />
                  {tierName}
                </Badge>
              </div>
              <Button variant="warrior-ghost" size="sm" onClick={onEditProfile}>
                <Edit size={16} />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {displayBio}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Marbling"
          value={profile.marbling_points || 0}
          icon={Target}
          color="gold"
        />
        <StatCard
          title="Sear Score"
          value={profile.sear_score || 0}
          icon={Flame}
          color="ember"
        />
        <StatCard
          title="Smoke Rings"
          value={profile.smoke_rings || 0}
          icon={Cigarette}
          color="smoke"
        />
      </div>

      {/* Favorite Cuts */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <h3 className="text-lg font-semibold text-foreground mb-4">Signature Cuts</h3>
        <div className="flex flex-wrap gap-2">
          {profile.favorites && typeof profile.favorites === 'object' && 
           Array.isArray((profile.favorites as any).cuts) ? 
           (profile.favorites as any).cuts.map((cut: string, index: number) => (
            <Badge
              key={index}
              variant="outline"
              className="border-warrior-ember/50 text-warrior-ember bg-warrior-ember/10"
            >
              {cut}
            </Badge>
          )) : (
            <p className="text-sm text-muted-foreground">No signature cuts selected yet.</p>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <h3 className="text-lg font-semibold text-foreground mb-4">Battle Honors</h3>
        <div className="grid grid-cols-2 gap-3">
          {profile.favorites && typeof profile.favorites === 'object' && 
           Array.isArray((profile.favorites as any).badges) ? 
           (profile.favorites as any).badges.map((badge: string, index: number) => (
            <div
              key={index}
              className="flex items-center p-3 rounded-lg warrior-gradient-smoke border border-warrior-gold/30"
            >
              <div className="w-8 h-8 rounded-full bg-warrior-gold flex items-center justify-center mr-3">
                <Star size={14} className="text-warrior-dark" fill="currentColor" />
              </div>
              <span className="text-sm font-medium text-foreground">{badge}</span>
            </div>
          )) : (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground text-center">No battle honors earned yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button variant="warrior" size="lg" className="w-full">
          Enter Butcher Studio
        </Button>
        <Button variant="warrior-outline" size="lg" className="w-full">
          Join Cigar Lounge
        </Button>
      </div>
    </div>
  );
};