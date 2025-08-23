import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useCigarLounges } from "@/hooks/useCigarLounges";
import { useLoungeChat } from "@/hooks/useLoungeChat";
import { CreateLoungeModal } from "./CreateLoungeModal";
import { LoungeChat } from "./LoungeChat";
import { LoungeVisualizer } from "./LoungeVisualizer";
import { CigarGame } from "@/components/studio/CigarGame";
import { YakuzaRobot } from "./YakuzaRobot";
import { DrinkingGame } from "./DrinkingGame";
import { Shield, Users, MessageCircle, Plus, LogOut, Cigarette, Wine, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CigarLounge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { 
    lounges, 
    currentLounge, 
    members, 
    loading, 
    joinLounge, 
    leaveCurrentLounge, 
    createLounge,
    updateCigarStatus,
    orderDrink,
    updateDrinkProgress
  } = useCigarLounges();
  
  const { messages, sendMessage } = useLoungeChat(currentLounge?.id);
  const [activeTab, setActiveTab] = useState<'lounge' | 'game' | 'chat' | 'robot'>('lounge');

  // Check if user needs age verification
  if (!profile?.age_verified) {
    return (
      <div className="min-h-screen warrior-dark flex items-center justify-center p-4">
        <Card className="warrior-glass border-warrior-ember/30 bg-warrior-ember/5 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-warrior-ember/20 flex items-center justify-center">
              <Shield className="text-warrior-ember" size={32} />
            </div>
            <CardTitle className="text-warrior-ember">Age Verification Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The Cigar Lounge is restricted to verified adults (21+). 
              Please verify your age to access this exclusive area.
            </p>
            <Button 
              variant="warrior" 
              onClick={() => navigate('/profile')}
              className="w-full"
            >
              Verify Age in Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen warrior-dark flex items-center justify-center">
        <div className="text-warrior-gold text-xl">Loading lounges...</div>
      </div>
    );
  }

  const currentMember = members.find(m => m.user_id === user?.id);

  return (
    <div className="min-h-screen warrior-dark p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-warrior-ember/20 flex items-center justify-center">
                <span className="text-2xl">🚬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Cigar Lounge</h1>
                <p className="text-sm text-muted-foreground">
                  {profile.age_verified ? 'Welcome to the exclusive lounge' : 'Age verification required'}
                </p>
              </div>
            </div>
            
            {!currentLounge && (
              <CreateLoungeModal
                onCreateLounge={createLounge}
              />
            )}
          </div>
        </div>

        {currentLounge ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Lounge Info & Tabs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Lounge Info */}
              <Card className="warrior-glass border-warrior-gold/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground flex items-center space-x-2">
                        <Users className="text-warrior-gold" size={20} />
                        <span>{currentLounge.name}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {members.length}/{currentLounge.max_members} members
                      </p>
                    </div>
                    <Button
                      onClick={leaveCurrentLounge}
                      variant="warrior-outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <LogOut size={14} />
                      <span>Leave</span>
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-warrior-leather/10 p-1 rounded-lg">
                <Button
                  variant={activeTab === 'lounge' ? 'warrior' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('lounge')}
                  className="flex-1"
                >
                  <Users size={16} className="mr-2" />
                  Lounge
                </Button>
                <Button
                  variant={activeTab === 'game' ? 'warrior' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('game')}
                  className="flex-1"
                >
                  <Cigarette size={16} className="mr-2" />
                  Cigar Selection
                </Button>
                <Button
                  variant={activeTab === 'chat' ? 'warrior' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  className="flex-1"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Chat
                </Button>
                <Button
                  variant={activeTab === 'robot' ? 'warrior' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('robot')}
                  className="flex-1"
                >
                  <Wine size={16} className="mr-2" />
                  Order Drinks
                </Button>
              </div>

              {/* Tab Content */}
              {/* Tab Content */}
              {activeTab === 'lounge' && (
                <LoungeVisualizer 
                  members={members} 
                  currentUserId={user?.id}
                  onCigarClick={() => setActiveTab('game')}
                  onDrinkClick={() => setActiveTab('robot')}
                  onBartenderClick={() => setActiveTab('robot')}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onDrinkProgressUpdate={updateDrinkProgress}
                  onCigarStatusUpdate={updateCigarStatus}
                />
              )}

              {activeTab === 'game' && currentMember && (
                <CigarGame
                  currentStatus={currentMember.cigar_status}
                  onStatusChange={(status, cigarId) => updateCigarStatus(status as any, cigarId)}
                  selectedCigarId={currentMember.selected_cigar_id || undefined}
                />
              )}

              {activeTab === 'chat' && (
                <LoungeChat
                  loungeId={currentLounge?.id || null}
                  isVisible={true}
                  onToggle={() => {}}
                />
              )}

              {activeTab === 'robot' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <YakuzaRobot 
                    onOrderDrink={orderDrink}
                    isVisible={true}
                  />
                  <DrinkingGame
                    drinkName={currentMember?.drink_order_id ? `Drink #${currentMember.drink_order_id}` : undefined}
                    drinkDifficulty="medium"
                    drinkProgress={currentMember?.drink_progress || 0}
                    onProgressUpdate={updateDrinkProgress}
                    onFinished={() => updateDrinkProgress(100)}
                    isActive={!!currentMember?.drink_order_id}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Members List */}
            <div className="space-y-6">
              <Card className="warrior-glass border-warrior-gold/20">
                <CardHeader>
                  <CardTitle className="text-foreground">Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-warrior-leather/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-warrior-gold/20 flex items-center justify-center text-sm font-medium text-warrior-gold">
                          {(member.handle || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {member.user_id === user?.id ? 'You' : (member.handle || 'Anonymous')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.cigar_status}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.cigar_status === 'selecting' && '🤔'}
                        {member.cigar_status === 'cut' && '✂️'}
                        {member.cigar_status === 'lit' && '🔥'}
                        {member.cigar_status === 'smoking' && '💨'}
                        {member.cigar_status === 'finished' && '✅'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Available Lounges */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Available Lounges</h2>
              <Badge variant="outline" className="text-warrior-gold">
                {lounges.length} Active
              </Badge>
            </div>

            {lounges.length === 0 ? (
              <Card className="warrior-glass border-warrior-gold/20">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">🏮</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Active Lounges</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to create a lounge and invite fellow warriors to join!
                  </p>
                  <CreateLoungeModal
                    onCreateLounge={createLounge}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lounges.map((lounge) => (
                  <Card key={lounge.id} className="warrior-glass border-warrior-gold/20 hover:border-warrior-gold/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground text-lg">{lounge.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {lounge.member_count}/{lounge.max_members}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Host: {lounge.host_handle}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => joinLounge(lounge.id)}
                        variant="warrior"
                        className="w-full"
                        disabled={lounge.member_count >= lounge.max_members}
                      >
                        {lounge.member_count >= lounge.max_members ? 'Full' : 'Join Lounge'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};