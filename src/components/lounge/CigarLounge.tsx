import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cigarette, Users, MessageCircle, Volume2, LogOut } from "lucide-react";
import { useCigarLounges } from "@/hooks/useCigarLounges";
import { CreateLoungeModal } from "./CreateLoungeModal";
import { LoungeChat } from "./LoungeChat";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const cigars = [
  { id: 1, name: "Cohiba Behike", strength: "Full", length: "6.5\"", ring: "52" },
  { id: 2, name: "Montecristo No. 2", strength: "Medium", length: "6.1\"", ring: "52" },
  { id: 3, name: "Romeo y Julieta", strength: "Mild", length: "5.5\"", ring: "42" },
  { id: 4, name: "Padron 1964", strength: "Full", length: "6\"", ring: "50" },
];

const CigarLoungeContent: React.FC = () => {
  const [selectedCigar, setSelectedCigar] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { 
    lounges, 
    currentLounge, 
    members, 
    loading, 
    joinLounge, 
    leaveCurrentLounge, 
    createLounge, 
    updateCigarStatus 
  } = useCigarLounges();

  const handleCigarAction = async (action: 'cut' | 'light' | 'smoke') => {
    if (!currentLounge || !selectedCigar) return;
    
    await updateCigarStatus(
      action === 'cut' ? 'cut' : action === 'light' ? 'lit' : 'smoking',
      selectedCigar
    );
  };

  const currentMember = members.find(m => m.user_id === currentLounge?.host_user_id);

  if (loading) {
    return (
      <div className="space-y-6 pb-24">
        <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
          <div className="text-center text-muted-foreground">Loading lounges...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cigarette className="text-warrior-gold" size={24} />
            <div>
              <h2 className="text-xl font-bold text-foreground">Cigar Lounge</h2>
              <p className="text-sm text-muted-foreground">
                {currentLounge ? `Currently in: ${currentLounge.name}` : 'Join a private club atmosphere'}
              </p>
            </div>
          </div>
          {currentLounge && (
            <Button
              variant="warrior-outline"
              size="sm"
              onClick={leaveCurrentLounge}
            >
              <LogOut size={16} className="mr-1" />
              Leave
            </Button>
          )}
        </div>
      </div>

      {!currentLounge ? (
        <>
          {/* Active Rooms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Active Lounges</h3>
            {lounges.length === 0 ? (
              <div className="warrior-glass rounded-xl p-6 border border-warrior-smoke/30 text-center">
                <p className="text-muted-foreground mb-4">No active lounges at the moment</p>
                <p className="text-sm text-muted-foreground">Be the first to create one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lounges.map((lounge) => (
                  <div key={lounge.id} className="warrior-glass rounded-xl p-4 border border-warrior-gold/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{lounge.name}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users size={14} />
                            <span>{lounge.member_count}/{lounge.max_members}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Host: {lounge.host_handle}</span>
                        </div>
                      </div>
                      <Button
                        variant="warrior-outline"
                        size="sm"
                        onClick={() => joinLounge(lounge.id)}
                        disabled={lounge.member_count >= lounge.max_members}
                      >
                        {lounge.member_count >= lounge.max_members ? 'Full' : 'Join'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <CreateLoungeModal onCreateLounge={createLounge} />
          </div>
        </>
      ) : (
        <>
          {/* Current Lounge Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Lounge Members</h3>
            <div className="warrior-glass rounded-xl p-4 border border-warrior-gold/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded bg-warrior-leather/20">
                    <div>
                      <span className="font-medium text-foreground">{member.handle}</span>
                      <div className="text-xs text-muted-foreground capitalize">
                        {member.cigar_status === 'selecting' ? 'Choosing cigar' : 
                         member.cigar_status === 'cut' ? 'Cigar cut' :
                         member.cigar_status === 'lit' ? 'Cigar lit' :
                         member.cigar_status === 'smoking' ? 'Smoking' :
                         'Finished'}
                      </div>
                    </div>
                    {member.selected_cigar_id && (
                      <Badge variant="outline" className="text-xs">
                        {cigars.find(c => c.id === member.selected_cigar_id)?.name}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cigar Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Select Your Cigar</h3>
            <div className="space-y-3">
              {cigars.map((cigar) => (
                <button
                  key={cigar.id}
                  onClick={() => {
                    setSelectedCigar(cigar.id);
                    updateCigarStatus('selecting', cigar.id);
                  }}
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

          {/* Cigar Actions */}
          {selectedCigar && (
            <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cigar Actions</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  <span className="text-sm font-medium text-foreground">
                    {cigars.find(c => c.id === selectedCigar)?.name}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant="warrior-outline" 
                    size="sm"
                    onClick={() => handleCigarAction('cut')}
                  >
                    Cut
                  </Button>
                  <Button 
                    variant="warrior-ember" 
                    size="sm"
                    onClick={() => handleCigarAction('light')}
                  >
                    Light
                  </Button>
                  <Button 
                    variant="warrior-ghost" 
                    size="sm"
                    onClick={() => handleCigarAction('smoke')}
                  >
                    Smoke
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-warrior-smoke/30">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageCircle size={16} />
                    Chat
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Volume2 size={16} />
                    Jazz {Math.random() > 0.5 ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Chat Component */}
      <LoungeChat
        loungeId={currentLounge?.id || null}
        isVisible={showChat}
        onToggle={() => setShowChat(!showChat)}
      />
    </div>
  );
};

export const CigarLounge: React.FC = () => {
  return (
    <ProtectedRoute requireAgeVerification>
      <CigarLoungeContent />
    </ProtectedRoute>
  );
};