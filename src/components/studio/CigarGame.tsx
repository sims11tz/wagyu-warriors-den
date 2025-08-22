import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
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
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'success' | 'fail'>('idle');
  const [progress, setProgress] = useState(0);
  const [cutPosition, setCutPosition] = useState(50);
  const [lightingProgress, setLightingProgress] = useState(0);
  const [puffCount, setPuffCount] = useState(0);
  const { toast } = useToast();

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

  // Lighting Game
  const handleLighting = () => {
    if (gameState === 'idle') {
      setGameState('playing');
      setLightingProgress(0);
      
      const interval = setInterval(() => {
        setLightingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setGameState('success');
            setTimeout(() => {
              onStatusChange('smoking');
              setGameState('idle');
              setPuffCount(0);
              toast({
                title: "Perfectly Lit!",
                description: "Your cigar is burning evenly. Enjoy!"
              });
            }, 1500);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  // Smoking Game
  const handlePuff = () => {
    setPuffCount(prev => prev + 1);
    if (puffCount >= 9) {
      onStatusChange('finished');
      toast({
        title: "Cigar Finished!",
        description: "What a wonderful smoking experience!"
      });
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
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔥</div>
              {gameState === 'playing' && (
                <>
                  <Progress value={lightingProgress} className="w-full mb-4" />
                  <p className="text-sm text-muted-foreground">Keep the flame steady...</p>
                </>
              )}
            </div>

            <Button
              onClick={handleLighting}
              disabled={gameState === 'playing'}
              variant="warrior"
              className="w-full"
            >
              {gameState === 'playing' ? 'Lighting...' : 'Light It Up'}
            </Button>

            {gameState === 'success' && (
              <div className="text-center text-warrior-gold">Beautifully lit! 🔥</div>
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