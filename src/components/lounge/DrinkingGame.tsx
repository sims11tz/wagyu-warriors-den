import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Wine, Target, Clock, Zap } from "lucide-react";

interface DrinkingGameProps {
  drinkName?: string;
  drinkDifficulty?: string;
  drinkProgress: number;
  onProgressUpdate: (progress: number) => void;
  onFinished: () => void;
  isActive: boolean;
}

export const DrinkingGame = ({ 
  drinkName, 
  drinkDifficulty, 
  drinkProgress, 
  onProgressUpdate, 
  onFinished,
  isActive 
}: DrinkingGameProps) => {
  const [gameState, setGameState] = useState<'idle' | 'sipping' | 'timing' | 'success'>('idle');
  const [sipTiming, setSipTiming] = useState(0);
  const [perfectTiming, setPerfectTiming] = useState(false);
  const { toast } = useToast();

  // Different difficulty levels affect timing windows
  const getDifficultySettings = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return { timingWindow: 3000, sipAmount: 20, perfectWindow: 1000 };
      case 'medium':
        return { timingWindow: 2000, sipAmount: 15, perfectWindow: 800 };
      case 'hard':
        return { timingWindow: 1500, sipAmount: 10, perfectWindow: 600 };
      default:
        return { timingWindow: 2000, sipAmount: 15, perfectWindow: 800 };
    }
  };

  const settings = getDifficultySettings(drinkDifficulty || 'medium');

  const handleSip = () => {
    if (!isActive || gameState !== 'idle') return;

    setGameState('timing');
    setSipTiming(0);
    setPerfectTiming(false);

    // Start timing challenge
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setSipTiming(elapsed);

      if (elapsed >= settings.timingWindow) {
        clearInterval(interval);
        // Failed timing
        setGameState('idle');
        toast({
          title: "Sip Too Slow!",
          description: "The perfect moment has passed. Try again!",
          variant: "destructive"
        });
      }
    }, 50);

    // Store interval ID for cleanup
    const intervalId = interval;
  };

  const completeSip = () => {
    if (gameState !== 'timing') return;

    const isInPerfectWindow = sipTiming <= settings.perfectWindow;
    const sipQuality = isInPerfectWindow ? 'perfect' : 'good';
    const progressIncrease = isInPerfectWindow ? settings.sipAmount + 5 : settings.sipAmount;

    setGameState('success');
    setPerfectTiming(isInPerfectWindow);

    const newProgress = Math.min(drinkProgress + progressIncrease, 100);
    onProgressUpdate(newProgress);

    setTimeout(() => {
      setGameState('idle');
      if (newProgress >= 100) {
        onFinished();
        toast({
          title: "Drink Finished!",
          description: `Excellent pairing with your cigar! The ${drinkName} was savored perfectly.`
        });
      } else {
        toast({
          title: isInPerfectWindow ? "Perfect Sip!" : "Good Sip!",
          description: isInPerfectWindow 
            ? "Exquisite timing! The flavors complement your cigar beautifully." 
            : "Well done! Continue savoring slowly."
        });
      }
    }, 1000);
  };

  if (!isActive || !drinkName) {
    return (
      <Card className="warrior-glass border-warrior-gold/20 opacity-50">
        <CardContent className="p-4 text-center">
          <div className="text-4xl mb-2">🍷</div>
          <p className="text-sm text-muted-foreground">Order a drink to begin</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="warrior-glass border-warrior-gold/20">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center space-x-2">
          <Wine className="text-warrior-gold" size={20} />
          <span>Drinking Experience</span>
        </CardTitle>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{drinkName}</span>
          <Badge variant="outline" className="text-xs">
            {drinkDifficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-warrior-gold">{Math.round(drinkProgress)}%</span>
          </div>
          <Progress value={drinkProgress} className="w-full" />
        </div>

        {/* Game State Display */}
        <div className="text-center space-y-4">
          {gameState === 'idle' && (
            <>
              <div className="text-4xl">🥃</div>
              <p className="text-sm text-muted-foreground">
                Take measured sips to savor the drink with your cigar
              </p>
            </>
          )}

          {gameState === 'timing' && (
            <>
              <div className="text-4xl animate-pulse">⏱️</div>
              <div className="space-y-2">
                <p className="text-sm text-warrior-gold font-medium">
                  Perfect timing window active!
                </p>
                <Progress 
                  value={(sipTiming / settings.timingWindow) * 100} 
                  className="w-full" 
                />
                <p className="text-xs text-muted-foreground">
                  Click "Complete Sip" at the perfect moment
                </p>
              </div>
            </>
          )}

          {gameState === 'success' && (
            <>
              <div className="text-4xl">
                {perfectTiming ? '🌟' : '👌'}
              </div>
              <p className="text-sm text-warrior-gold">
                {perfectTiming ? 'Perfect timing!' : 'Well done!'}
              </p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {gameState === 'idle' && drinkProgress < 100 && (
            <Button
              onClick={handleSip}
              variant="warrior"
              className="w-full"
            >
              <Target className="mr-2" size={16} />
              Take a Sip
            </Button>
          )}

          {gameState === 'timing' && (
            <Button
              onClick={completeSip}
              variant="warrior"
              className="w-full animate-pulse"
            >
              <Zap className="mr-2" size={16} />
              Complete Sip
            </Button>
          )}

          {drinkProgress >= 100 && (
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-warrior-gold font-medium">Drink completed!</p>
              <p className="text-xs text-muted-foreground">
                Perfect pairing with your cigar experience
              </p>
            </div>
          )}
        </div>

        {/* Difficulty Info */}
        <div className="text-xs text-muted-foreground text-center bg-warrior-leather/10 rounded p-2">
          <div className="flex items-center justify-center space-x-4">
            <span>🎯 Timing: {settings.perfectWindow}ms perfect window</span>
            <span>📊 Sip value: {settings.sipAmount}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};