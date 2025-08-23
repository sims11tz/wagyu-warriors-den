import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Trophy, Timer, Flame, Thermometer } from 'lucide-react';
import { toast } from 'sonner';

interface SearingGameProps {
  cutType: string;
  cutName: string;
  onComplete: (score: number, technique: string) => void;
  onClose: () => void;
}

interface SearZone {
  x: number;
  y: number;
  seared: number; // 0 to 100
  overcooked: boolean;
}

export const SearingGame: React.FC<SearingGameProps> = ({
  cutType,
  cutName,
  onComplete,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [temperature, setTemperature] = useState(350); // Starting temp
  const [targetTemp, setTargetTemp] = useState(425); // Ideal searing temp
  const [currentSide, setCurrentSide] = useState<'side1' | 'side2' | 'resting'>('side1');
  const [sideTime, setSideTime] = useState(0);
  const [score, setScore] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [pressPosition, setPressPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Searing zones for the meat (side 1 and side 2)
  const [searZonesSide1, setSearZonesSide1] = useState<SearZone[]>([]);
  const [searZonesSide2, setSearZonesSide2] = useState<SearZone[]>([]);

  // Initialize searing zones
  useEffect(() => {
    const zones: SearZone[] = [];
    // Create a grid of searing zones across the meat
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 3; y++) {
        zones.push({
          x: 120 + x * 80,
          y: 150 + y * 70,
          seared: 0,
          overcooked: false
        });
      }
    }
    setSearZonesSide1([...zones]);
    setSearZonesSide2([...zones]);
  }, []);

  // Game timer and heat management
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });

      setSideTime(prev => prev + 0.1);

      // Temperature fluctuation (more realistic cooking)
      setTemperature(prev => {
        let newTemp = prev;
        // Temperature naturally decreases when searing
        if (isPressed) {
          newTemp -= 2;
        } else {
          newTemp += 1; // Heat recovers when not searing
        }
        return Math.max(250, Math.min(500, newTemp));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, isPressed]);

  // Auto-flip logic
  useEffect(() => {
    if (currentSide === 'side1' && sideTime >= 15) {
      setCurrentSide('side2');
      setSideTime(0);
      toast.success('Perfect timing! Flip to side 2!');
    } else if (currentSide === 'side2' && sideTime >= 15) {
      setCurrentSide('resting');
      setSideTime(0);
      toast.success('Great! Now let it rest...');
      // Auto-complete after resting
      setTimeout(() => {
        completeGame();
      }, 3000);
    }
  }, [sideTime, currentSide]);

  const completeGame = () => {
    const finalScore = calculateFinalScore();
    const technique = getTechnique(finalScore);
    setScore(finalScore);
    setGameEnded(true);
    onComplete(finalScore, technique);
  };

  const calculateFinalScore = () => {
    const side1Zones = searZonesSide1;
    const side2Zones = searZonesSide2;
    
    let totalSeared = 0;
    let overcooked = 0;
    let evenness = 0;

    [...side1Zones, ...side2Zones].forEach(zone => {
      totalSeared += zone.seared;
      if (zone.overcooked) overcooked += 50; // Penalty for overcooking
    });

    // Calculate evenness (how uniform the searing is)
    const avgSeared = totalSeared / (side1Zones.length + side2Zones.length);
    [...side1Zones, ...side2Zones].forEach(zone => {
      evenness += Math.abs(zone.seared - avgSeared);
    });

    // Scoring formula
    const searingScore = Math.min(1000, totalSeared * 2);
    const evennessScore = Math.max(0, 500 - evenness * 5);
    const penaltyScore = overcooked;
    
    return Math.max(0, searingScore + evennessScore - penaltyScore);
  };

  const getTechnique = (score: number): string => {
    if (score >= 800) return 'Master Chef';
    if (score >= 600) return 'Skilled Cook';
    if (score >= 400) return 'Good Technique';
    return 'Needs Practice';
  };

  const handleCanvasInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Canvas clicked!', { gameStarted, gameEnded, currentSide });
    
    if (!gameStarted || gameEnded || currentSide === 'resting') {
      console.log('Interaction blocked:', { gameStarted, gameEnded, currentSide });
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas found');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('Click position:', { x, y });
    
    setPressPosition({ x, y });
    setIsPressed(true);

    // Check if clicking on meat zones and update searing
    const currentZones = currentSide === 'side1' ? searZonesSide1 : searZonesSide2;
    const setCurrentZones = currentSide === 'side1' ? setSearZonesSide1 : setSearZonesSide2;
    
    console.log('Current zones:', currentZones.length);
    
    const updatedZones = currentZones.map(zone => {
      const distance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
      if (distance < 40) { // Within searing radius
        console.log('Hit zone!', { distance, zone, temperature });
        let newSeared = zone.seared;
        
        // Searing effectiveness based on temperature
        if (temperature >= 400 && temperature <= 450) {
          newSeared += 3; // Perfect temperature
        } else if (temperature >= 350) {
          newSeared += 1; // Too cool
        } else {
          // Too hot, risk of overcooking
          newSeared += 2;
          if (newSeared > 80) {
            console.log('Zone overcooked!');
            return { ...zone, seared: 100, overcooked: true };
          }
        }
        
        const updatedZone = { ...zone, seared: Math.min(100, newSeared) };
        console.log('Zone updated:', { old: zone.seared, new: updatedZone.seared });
        return updatedZone;
      }
      return zone;
    });
    
    setCurrentZones(updatedZones);
  }, [gameStarted, gameEnded, currentSide, temperature, searZonesSide1, searZonesSide2]);

  const handleCanvasMouseUp = () => {
    setIsPressed(false);
    setPressPosition(null);
  };

  // Draw the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (gameStarted) {
      console.log('Drawing game state:', { currentSide, zonesCount: searZonesSide1.length });
      
      // Draw meat base
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(100, 130, 420, 210);
      
      // Draw searing zones
      const currentZones = currentSide === 'side1' ? searZonesSide1 : 
                          currentSide === 'side2' ? searZonesSide2 : [];

      console.log('Drawing zones:', currentZones.length);

      currentZones.forEach((zone, index) => {
        // Zone background
        ctx.fillStyle = zone.overcooked ? '#8B0000' : 
                       zone.seared > 60 ? '#D2691E' : 
                       zone.seared > 30 ? '#CD853F' : '#DEB887';
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Zone border for visibility
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Searing progress indicator
        if (zone.seared > 0) {
          ctx.fillStyle = zone.overcooked ? '#FF0000' : '#8B4513';
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, 35 * (zone.seared / 100), 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Debug: show zone numbers
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(index.toString(), zone.x, zone.y + 4);
      });

      // Draw current press position
      if (isPressed && pressPosition) {
        console.log('Drawing press effect at:', pressPosition);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(pressPosition.x, pressPosition.y, 45, 0, Math.PI * 2);
        ctx.fill();

        // Sizzle effect
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6;
          const sparkX = pressPosition.x + Math.cos(angle) * (30 + Math.random() * 20);
          const sparkY = pressPosition.y + Math.sin(angle) * (30 + Math.random() * 20);
          
          ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, ${0.3 + Math.random() * 0.7})`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Side indicator
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        currentSide === 'side1' ? 'Side 1 - Sear evenly!' :
        currentSide === 'side2' ? 'Side 2 - Finish strong!' : 
        'Resting - Let the juices settle...', 
        width / 2, 50
      );
    }
  }, [gameStarted, currentSide, searZonesSide1, searZonesSide2, isPressed, pressPosition]);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(45);
    setScore(0);
    setGameEnded(false);
    setCurrentSide('side1');
    setSideTime(0);
    setTemperature(350);
  };

  const getTemperatureColor = () => {
    if (temperature >= 400 && temperature <= 450) return 'text-green-400';
    if (temperature >= 350 && temperature <= 475) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-warrior-leather rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-warrior-gold">Searing Challenge</h2>
            <p className="text-warrior-light">Perfect the {cutName}</p>
          </div>
          <Button variant="warrior-ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {!gameStarted ? (
          <div className="text-center space-y-6">
            <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
              <Flame className="w-16 h-16 text-warrior-ember mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Master the Sear</h3>
              <div className="space-y-3 text-sm text-warrior-light text-left">
                <p>🔥 <span className="text-warrior-gold">Click and hold</span> on the meat to sear different zones</p>
                <p>🌡️ <span className="text-green-400">Maintain 400-450°F</span> for perfect searing</p>
                <p>⏰ <span className="text-orange-400">15 seconds per side</span> - timing is everything!</p>
                <p>🎯 <span className="text-warrior-ember">Sear evenly</span> across all zones for maximum score</p>
                <p className="text-red-400 font-semibold">⚠️ Too hot = overcooked and ruined!</p>
              </div>
            </div>
            <Button variant="warrior" size="lg" onClick={startGame} className="w-full">
              Start Searing Challenge
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <Badge variant="outline" className="border-warrior-gold text-warrior-gold">
                <Timer size={14} className="mr-1" />
                {timeLeft}s
              </Badge>
              <Badge variant="outline" className={`border-current ${getTemperatureColor()}`}>
                <Thermometer size={14} className="mr-1" />
                {Math.round(temperature)}°F
              </Badge>
              <Badge variant="outline" className="border-warrior-ember text-warrior-ember">
                <Trophy size={14} className="mr-1" />
                {Math.round(score)}
              </Badge>
              <Badge variant="outline" className="border-warrior-smoke text-warrior-smoke">
                Side: {currentSide === 'side1' ? '1' : currentSide === 'side2' ? '2' : 'Rest'} 
                ({Math.round(sideTime)}s)
              </Badge>
            </div>

            <div className="relative mb-4">
              <canvas
                ref={canvasRef}
                width={620}
                height={400}
                className="w-full border-2 border-warrior-gold/30 rounded-lg cursor-crosshair bg-warrior-dark"
                onMouseDown={handleCanvasInteraction}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
              
              {gameEnded && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                  <div className="text-center bg-warrior-leather p-6 rounded-xl border-2 border-warrior-gold/50">
                    <Trophy className="w-16 h-16 text-warrior-gold mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-warrior-gold mb-2">Searing Complete!</h3>
                    <p className="text-lg text-warrior-ember font-semibold mb-2">{getTechnique(score)}</p>
                    <p className="text-warrior-gold font-bold text-xl">Score: {Math.round(score)}</p>
                    <p className="text-warrior-light text-sm mt-2">Ready for slicing!</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {currentSide === 'resting' ? 
                'Let the meat rest to retain juices...' :
                'Click and hold on different zones to sear evenly. Watch the temperature!'
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
};