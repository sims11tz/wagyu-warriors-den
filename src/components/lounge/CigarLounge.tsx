import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cigarette, Users, MessageCircle, Volume2 } from "lucide-react";

const cigars = [
  { id: 1, name: "Cohiba Behike", strength: "Full", length: "6.5\"", ring: "52" },
  { id: 2, name: "Montecristo No. 2", strength: "Medium", length: "6.1\"", ring: "52" },
  { id: 3, name: "Romeo y Julieta", strength: "Mild", length: "5.5\"", ring: "42" },
  { id: 4, name: "Padron 1964", strength: "Full", length: "6\"", ring: "50" },
];

const activeRooms = [
  { id: 1, name: "Evening Smoke", members: 3, maxMembers: 6, host: "SteakSensei47" },
  { id: 2, name: "Masters Only", members: 2, maxMembers: 4, host: "CigarMaster_Tokyo" },
];

export const CigarLounge: React.FC = () => {
  const [selectedCigar, setSelectedCigar] = useState<number | null>(null);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <div className="flex items-center space-x-3">
          <Cigarette className="text-warrior-gold" size={24} />
          <div>
            <h2 className="text-xl font-bold text-foreground">Cigar Lounge</h2>
            <p className="text-sm text-muted-foreground">Smoke with fellow warriors (21+ only)</p>
          </div>
        </div>
      </div>

      {/* Age Gate Notice */}
      <div className="warrior-glass rounded-xl p-4 border border-warrior-ember/30 bg-warrior-ember/5">
        <p className="text-sm text-warrior-ember font-medium">
          ⚠️ This section is restricted to members 21 years and older
        </p>
      </div>

      {/* Active Rooms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Active Lounges</h3>
        <div className="space-y-3">
          {activeRooms.map((room) => (
            <div key={room.id} className="warrior-glass rounded-xl p-4 border border-warrior-gold/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{room.name}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Users size={14} />
                      <span>{room.members}/{room.maxMembers}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Host: {room.host}</span>
                  </div>
                </div>
                <Button
                  variant="warrior-outline"
                  size="sm"
                  onClick={() => setCurrentRoom(room.id)}
                >
                  Join
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="warrior" className="w-full">
          Create New Lounge
        </Button>
      </div>

      {/* Cigar Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Select Your Cigar</h3>
        <div className="space-y-3">
          {cigars.map((cigar) => (
            <button
              key={cigar.id}
              onClick={() => setSelectedCigar(cigar.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedCigar === cigar.id
                  ? "border-warrior-gold bg-warrior-gold/10 warrior-shadow-gold"
                  : "border-warrior-smoke/30 bg-warrior-leather/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{cigar.name}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {cigar.strength}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {cigar.length} × {cigar.ring}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Session */}
      {currentRoom && selectedCigar && (
        <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">Current Session</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Room:</span>
              <span className="text-sm font-medium text-foreground">
                {activeRooms.find(r => r.id === currentRoom)?.name}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cigar:</span>
              <span className="text-sm font-medium text-foreground">
                {cigars.find(c => c.id === selectedCigar)?.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button variant="warrior-outline" size="sm">
                Cut
              </Button>
              <Button variant="warrior-ember" size="sm">
                Light
              </Button>
              <Button variant="warrior-ghost" size="sm">
                Smoke
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-warrior-smoke/30">
              <Button variant="ghost" size="sm">
                <MessageCircle size={16} />
                Chat
              </Button>
              <Button variant="ghost" size="sm">
                <Volume2 size={16} />
                Jazz On
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};