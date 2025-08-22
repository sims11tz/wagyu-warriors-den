import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import { Flame, Target, Coffee, Edit, Trophy, Star } from "lucide-react";
import warriorAvatar from "@/assets/warrior-avatar.jpg";

interface WarriorProfileProps {
  onEditProfile: () => void;
}

export const WarriorProfile: React.FC<WarriorProfileProps> = ({ onEditProfile }) => {
  // Mock user data - in real app this would come from props/context
  const warriorData = {
    handle: "SteakSensei47",
    tier: "Founding Warrior",
    bio: "Master of the blade, seeker of perfect marbling. Honor through beef.",
    stats: {
      marblingPoints: 2847,
      searScore: 1923,
      smokeRings: 156,
    },
    badges: ["First Cut", "Perfect Sear", "Master Smoker"],
    favoriteCuts: ["Ribeye A5", "Wagyu Tenderloin", "Dry-Aged Strip"],
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Profile Section */}
      <div className="relative warrior-gradient-leather rounded-2xl p-6 warrior-shadow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warrior-gold/10 to-transparent" />
        <div className="relative flex items-start space-x-4">
          <div className="relative">
            <img
              src={warriorAvatar}
              alt="Warrior Avatar"
              className="w-20 h-20 rounded-full object-cover border-3 border-warrior-gold warrior-shadow-gold"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-warrior-gold rounded-full">
              <Star size={12} className="text-warrior-dark" fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">{warriorData.handle}</h1>
                <Badge variant="outline" className="border-warrior-gold text-warrior-gold bg-warrior-gold/10 mt-1">
                  <Trophy size={12} className="mr-1" />
                  {warriorData.tier}
                </Badge>
              </div>
              <Button variant="warrior-ghost" size="sm" onClick={onEditProfile}>
                <Edit size={16} />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {warriorData.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Marbling"
          value={warriorData.stats.marblingPoints}
          icon={Target}
          color="gold"
        />
        <StatCard
          title="Sear Score"
          value={warriorData.stats.searScore}
          icon={Flame}
          color="ember"
        />
        <StatCard
          title="Smoke Rings"
          value={warriorData.stats.smokeRings}
          icon={Coffee}
          color="smoke"
        />
      </div>

      {/* Favorite Cuts */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <h3 className="text-lg font-semibold text-foreground mb-4">Signature Cuts</h3>
        <div className="flex flex-wrap gap-2">
          {warriorData.favoriteCuts.map((cut, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-warrior-ember/50 text-warrior-ember bg-warrior-ember/10"
            >
              {cut}
            </Badge>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <h3 className="text-lg font-semibold text-foreground mb-4">Battle Honors</h3>
        <div className="grid grid-cols-2 gap-3">
          {warriorData.badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center p-3 rounded-lg warrior-gradient-smoke border border-warrior-gold/30"
            >
              <div className="w-8 h-8 rounded-full bg-warrior-gold flex items-center justify-center mr-3">
                <Star size={14} className="text-warrior-dark" fill="currentColor" />
              </div>
              <span className="text-sm font-medium text-foreground">{badge}</span>
            </div>
          ))}
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