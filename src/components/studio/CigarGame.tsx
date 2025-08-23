import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Scissors, Target, Wind } from "lucide-react";

interface CigarOption {
  id: number;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  flavor: string;
}

const cigarOptions: CigarOption[] = [
  {
    id: 1,
    name: "Warrior's Choice",
    description: "A robust full-bodied cigar with notes of leather and spice",
    difficulty: 'Medium',
    flavor: 'Spicy'
  },
  {
    id: 2,
    name: "Smoke Ring Special",
    description: "Smooth and creamy with hints of vanilla and cedar",
    difficulty: 'Easy',
    flavor: 'Mild'
  },
  {
    id: 3,
    name: "Master's Reserve",
    description: "Complex flavors with dark chocolate and coffee notes",
    difficulty: 'Hard',
    flavor: 'Bold'
  }
];

interface CigarGameProps {
  currentStatus: string;
  onStatusChange: (status: string, cigarId?: number) => void;
  selectedCigarId?: number;
}

export const CigarGame = ({ currentStatus, onStatusChange, selectedCigarId }: CigarGameProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'success' | 'fail'>('idle');
  const [progress, setProgress] = useState(0);
  const [cutPosition, setCutPosition] = useState(50);
  const [lightingProgress, setLightingProgress] = useState(0);
  const [puffCount, setPuffCount] = useState(0);
  const [lighterPosition, setLighterPosition] = useState({ x: 50, y: 50 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLighterActive, setIsLighterActive] = useState(false);

  const selectedCigar = cigarOptions.find(c => c.id === selectedCigarId);

  // Selection Game
  const handleCigarSelect = (cigar: CigarOption) => {
    onStatusChange('cut', cigar.id);
    toast({
      title: "Cigar Selected!",
      description: `You chose ${cigar.name}. Time to cut it!`
    });
  };

  // Cutting Game
  const handleCutting = () => {
    if (gameState === 'idle') {
      setGameState('playing');
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            const accuracy = Math.abs(cutPosition - 50);
            if (accuracy <= 15) {
              setGameState('success');
              setTimeout(() => {
                onStatusChange('lit');
                setGameState('idle');
                toast({
                  title: "Perfect Cut!",
                  description: "Your cigar is ready to light!"
                });
              }, 1500);
            } else {
              setGameState('fail');
              setTimeout(() => {
                setGameState('idle');
                toast({
                  title: "Try Again",
                  description: "The cut wasn't quite right. Give it another try!",
                  variant: "destructive"
                });
              }, 1500);
            }
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    }
  };

  // Lighting Game - Interactive lighter tracking
  const handleStartLighting = () => {
    if (gameState === 'idle') {
      setGameState('playing');
      setLightingProgress(0);
      setIsLighterActive(true);
      setLighterPosition({ x: 50, y: 50 });
      
      let steadyTime = 0;
      const targetTime = 2000; // 2 seconds of steady holding (reduced from 3)
      
      const gameLoop = setInterval(() => {
        // Move lighter randomly every 500ms (slower from 200ms)
        setLighterPosition(prev => ({
          x: Math.max(15, Math.min(85, prev.x + (Math.random() - 0.5) * 10)), // Reduced movement range from 20 to 10
          y: Math.max(15, Math.min(85, prev.y + (Math.random() - 0.5) * 10))
        }));
        
        // Check if mouse is close enough to lighter
        const distance = Math.sqrt(
          Math.pow(mousePosition.x - lighterPosition.x, 2) + 
          Math.pow(mousePosition.y - lighterPosition.y, 2)
        );
        
        if (distance < 15) { // Within 15% of the game area (increased from 8%)
          steadyTime += 500; // Increment matches the interval
          setLightingProgress((steadyTime / targetTime) * 100);
          
          if (steadyTime >= targetTime) {
            clearInterval(gameLoop);
            setGameState('success');
            setIsLighterActive(false);
            setTimeout(() => {
              onStatusChange('smoking');
              setGameState('idle');
              setPuffCount(0);
              toast({
                title: "Perfectly Lit!",
                description: "Your steady hand lit the cigar beautifully!"
              });
            }, 1500);
          }
        } else {
          // Lose progress more slowly if not keeping flame steady
          steadyTime = Math.max(0, steadyTime - 200); // Less harsh progress loss
          setLightingProgress((steadyTime / targetTime) * 100);
        }
      }, 500); // Slower interval from 200ms to 500ms
      
      // Auto-fail after 15 seconds
      const timeoutId = setTimeout(() => {
        clearInterval(gameLoop);
        setGameState('fail');
        setIsLighterActive(false);
        setTimeout(() => {
          setGameState('idle');
          toast({
            title: "Time's Up!",
            description: "The lighter went out. Try again!",
            variant: "destructive"
          });
        }, 1500);
      }, 15000);
    }
  };

  // Track mouse position within the lighting game area
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLighterActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  // Smoking Game
  const handlePuff = async () => {
    const newPuffCount = puffCount + 1;
    setPuffCount(newPuffCount);
    
    if (newPuffCount >= 10) {
      onStatusChange('finished');
      
      // Award smoke rings when cigar is finished
      if (user) {
        try {
          const ringsEarned = selectedCigar?.difficulty === 'Hard' ? 3 : 
                            selectedCigar?.difficulty === 'Medium' ? 2 : 1;
          
          await supabase.rpc('update_smoke_rings', { 
            p_user_id: user.id, 
            p_rings: ringsEarned 
          });
          
          toast({
            title: "Cigar Finished!",
            description: `What a wonderful smoking experience! You earned ${ringsEarned} smoke rings! 💨`
          });
        } catch (error) {
          console.error('Error updating smoke rings:', error);
          toast({
            title: "Cigar Finished!",
            description: "What a wonderful smoking experience!"
          });
        }
      }
    }
  };

  const renderGame = () => {
    switch (currentStatus) {
      case 'selecting':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-warrior-gold">Choose Your Cigar</h3>
            <div className="grid gap-3">
              {cigarOptions.map((cigar) => (
                <Card 
                  key={cigar.id} 
                  className="warrior-glass border-warrior-gold/30 cursor-pointer hover:border-warrior-gold/60 transition-colors"
                  onClick={() => handleCigarSelect(cigar)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground">{cigar.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {cigar.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{cigar.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {cigar.flavor}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'cut':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scissors className="text-warrior-gold" size={20} />
              <h3 className="text-lg font-semibold text-warrior-gold">Cut Your Cigar</h3>
            </div>
            {selectedCigar && (
              <p className="text-sm text-muted-foreground">
                Cutting: {selectedCigar.name}
              </p>
            )}
            
            <div className="relative">
              <div className="w-full h-8 bg-warrior-leather/20 rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 h-full w-1 bg-warrior-gold transition-all duration-100"
                  style={{ left: `${cutPosition}%` }}
                />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-6 bg-warrior-ember/30 rounded" />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={cutPosition}
                onChange={(e) => setCutPosition(Number(e.target.value))}
                className="w-full mt-2 opacity-75"
                disabled={gameState === 'playing'}
              />
            </div>

            {gameState === 'playing' && (
              <Progress value={progress} className="w-full" />
            )}

            <Button
              onClick={handleCutting}
              disabled={gameState === 'playing'}
              variant="warrior"
              className="w-full"
            >
              {gameState === 'playing' ? 'Cutting...' : 'Make the Cut'}
            </Button>

            {gameState === 'success' && (
              <div className="text-center text-warrior-gold">Perfect cut! ✂️</div>
            )}
            {gameState === 'fail' && (
              <div className="text-center text-warrior-ember">Try again! 🔄</div>
            )}
          </div>
        );

      case 'lit':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Flame className="text-warrior-ember" size={20} />
              <h3 className="text-lg font-semibold text-warrior-gold">Light Your Cigar</h3>
            </div>
            
            {gameState === 'playing' && isLighterActive ? (
              <div className="space-y-4">
                <div 
                  className="relative w-full h-64 bg-warrior-leather/20 rounded-lg border-2 border-warrior-gold/30 cursor-crosshair overflow-hidden"
                  onMouseMove={handleMouseMove}
                >
                  {/* Cigar tip in center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-warrior-ember rounded-full" />
                  
                  {/* Moving lighter */}
                  <div 
                    className="absolute w-8 h-8 text-2xl transition-all duration-200 ease-out"
                    style={{ 
                      left: `${lighterPosition.x}%`, 
                      top: `${lighterPosition.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    🔥
                  </div>
                  
                  {/* Mouse cursor indicator */}
                  <div 
                    className="absolute w-2 h-2 bg-warrior-gold rounded-full pointer-events-none"
                    style={{ 
                      left: `${mousePosition.x}%`, 
                      top: `${mousePosition.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
                
                <Progress value={lightingProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Keep your cursor on the flame! {Math.round(lightingProgress)}%
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">🚬</div>
                <p className="text-sm text-muted-foreground">
                  Click to start the lighter and keep the flame steady on the cigar tip
                </p>
                
                <Button
                  onClick={handleStartLighting}
                  disabled={gameState === 'playing'}
                  variant="warrior"
                  className="w-full"
                >
                  {gameState === 'playing' ? 'Lighting...' : 'Start Lighter 🔥'}
                </Button>
              </div>
            )}

            {gameState === 'success' && (
              <div className="text-center text-warrior-gold">Beautifully lit! 🔥</div>
            )}
            
            {gameState === 'fail' && (
              <div className="text-center text-warrior-ember">Keep it steady! 🔄</div>
            )}
          </div>
        );

      case 'smoking':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Wind className="text-warrior-smoke" size={20} />
              <h3 className="text-lg font-semibold text-warrior-gold">Enjoy Your Smoke</h3>
            </div>
            
            <div className="text-center">
              <div className="text-6xl mb-4">💨</div>
              <p className="text-sm text-muted-foreground mb-4">
                Puffs taken: {puffCount}/10
              </p>
              <Progress value={(puffCount / 10) * 100} className="w-full mb-4" />
            </div>

            <Button
              onClick={handlePuff}
              variant="warrior"
              className="w-full"
            >
              Take a Puff 💨
            </Button>
          </div>
        );

      case 'finished':
        return (
          <div className="space-y-4 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-warrior-gold">Cigar Complete!</h3>
            <p className="text-muted-foreground">
              You've finished your {selectedCigar?.name || 'cigar'}. Well done, warrior!
            </p>
            <Button
              onClick={() => onStatusChange('selecting')}
              variant="warrior-outline"
              className="w-full"
            >
              Select Another Cigar
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-muted-foreground">Game loading...</p>
          </div>
        );
    }
  };

  return (
    <Card className="warrior-glass border-warrior-gold/20">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center space-x-2">
          <Target className="text-warrior-gold" size={20} />
          <span>Cigar Experience</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderGame()}
      </CardContent>
    </Card>
  );
};