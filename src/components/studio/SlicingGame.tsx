import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Trophy, Timer, Target } from 'lucide-react';
import wagyuCuttingBoard from '@/assets/wagyu-cutting-board.jpg';
import yakuzaWarriorEating from '@/assets/yakuza-warrior-eating.jpg';

interface SlicingGameProps {
  cutType: string;
  cutName: string;
  onComplete: (score: number, cuts: number) => void;
  onClose: () => void;
}

interface SliceLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  quality: 'perfect' | 'good' | 'poor';
}

interface CutEffect {
  x: number;
  y: number;
  opacity: number;
  timestamp: number;
}

export const SlicingGame: React.FC<SlicingGameProps> = ({
  cutType,
  cutName,
  onComplete,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSlicing, setIsSlicing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [cuts, setCuts] = useState<SliceLine[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [completionReason, setCompletionReason] = useState<'time' | 'perfect'>('time');
  const [cutEffects, setCutEffects] = useState<CutEffect[]>([]);
  const [previewLine, setPreviewLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCompletionReason('time');
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded]);

  // End game when time runs out
  useEffect(() => {
    if (gameEnded && gameStarted) {
      const finalScore = calculateFinalScore();
      onComplete(finalScore, cuts.length);
    }
  }, [gameEnded, gameStarted, cuts, timeLeft, completionReason]);

  const calculateFinalScore = () => {
    const perfectCuts = cuts.filter(cut => cut.quality === 'perfect').length;
    const goodCuts = cuts.filter(cut => cut.quality === 'good').length;
    const poorCuts = cuts.filter(cut => cut.quality === 'poor').length;
    
    let baseScore = (perfectCuts * 100) + (goodCuts * 60) + (poorCuts * 20);
    
    // Add time bonus if completed early with 5 perfect cuts
    if (completionReason === 'perfect' && timeLeft > 0) {
      const timeBonus = timeLeft * 10; // 10 points per second remaining
      baseScore += timeBonus;
    }
    
    return baseScore;
  };

  // Add cut effect animation
  const addCutEffect = useCallback((x: number, y: number) => {
    const effect: CutEffect = {
      x,
      y,
      opacity: 1,
      timestamp: Date.now()
    };
    setCutEffects(prev => [...prev, effect]);
    
    // Remove effect after animation
    setTimeout(() => {
      setCutEffects(prev => prev.filter(e => e.timestamp !== effect.timestamp));
    }, 1000);
  }, []);

  const drawMeatImage = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const img = imageRef.current;
    if (img && img.complete) {
      // Calculate dimensions to fit the meat in the center area
      const padding = 40;
      const drawWidth = width - (padding * 2);
      const drawHeight = height - (padding * 2);
      
      // Draw the wagyu image
      ctx.drawImage(img, padding, padding, drawWidth, drawHeight);
      
      // Add subtle overlay to make cuts more visible
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(padding, padding, drawWidth, drawHeight);
    }
  }, []);

  const drawGuideLines = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.globalAlpha = 0.6;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 2;
    
    // Draw suggested cut lines for steaks - vertical cuts
    const numLines = 5;
    const padding = 40;
    const meatWidth = width - (padding * 2);
    const spacing = meatWidth / (numLines + 1);
    
    for (let i = 1; i <= numLines; i++) {
      const x = padding + spacing * i;
      ctx.beginPath();
      ctx.moveTo(x, padding + 20);
      ctx.lineTo(x, height - padding - 20);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }, []);

  const drawCuts = useCallback((ctx: CanvasRenderingContext2D) => {
    cuts.forEach((cut) => {
      // Draw cut shadow for depth
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cut.x1 + 2, cut.y1 + 2);
      ctx.lineTo(cut.x2 + 2, cut.y2 + 2);
      ctx.stroke();
      
      // Draw actual cut
      ctx.strokeStyle = 
        cut.quality === 'perfect' ? '#00FF88' :
        cut.quality === 'good' ? '#FFB84D' : '#FF4444';
      ctx.lineWidth = 4;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cut.x1, cut.y1);
      ctx.lineTo(cut.x2, cut.y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }, [cuts]);

  const drawPreviewLine = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!previewLine) return;
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.globalAlpha = 0.9;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(previewLine.x1, previewLine.y1);
    ctx.lineTo(previewLine.x2, previewLine.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }, [previewLine]);
  
  const drawCutEffects = useCallback((ctx: CanvasRenderingContext2D) => {
    const now = Date.now();
    cutEffects.forEach((effect) => {
      const age = now - effect.timestamp;
      const progress = age / 1000; // 1 second animation
      const opacity = Math.max(0, 1 - progress);
      const size = 10 + (progress * 20);
      
      if (opacity > 0) {
        ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add sparkle effect
        for (let i = 0; i < 3; i++) {
          const angle = (i * Math.PI * 2) / 3 + progress * Math.PI * 2;
          const sparkleX = effect.x + Math.cos(angle) * size * 1.5;
          const sparkleY = effect.y + Math.sin(angle) * size * 1.5;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }, [cutEffects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Always draw meat background when game is started
    if (gameStarted) {
      drawMeatImage(ctx, width, height);
      if (!gameEnded) {
        drawGuideLines(ctx, width, height);
      }
      drawCuts(ctx);
      drawPreviewLine(ctx);
      drawCutEffects(ctx);
    }
  }, [gameStarted, cuts, gameEnded, previewLine, cutEffects, drawMeatImage, drawGuideLines, drawCuts, drawPreviewLine, drawCutEffects]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted || gameEnded) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setIsSlicing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX - rect.left;
      const currentY = moveEvent.clientY - rect.top;
      
      // Update preview line state instead of directly drawing
      setPreviewLine({
        x1: startX,
        y1: startY,
        x2: currentX,
        y2: currentY,
      });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const endX = upEvent.clientX - rect.left;
      const endY = upEvent.clientY - rect.top;
      
      // Evaluate cut quality - favor vertical cuts for steaks
      const cutLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      const angle = Math.abs(Math.atan2(endY - startY, endX - startX));
      
      // For wagyu steaks, we want more vertical cuts (angle closer to π/2)
      const verticalAngle = Math.abs(angle - Math.PI/2);
      
      let quality: 'perfect' | 'good' | 'poor';
      if (cutLength > 120 && verticalAngle < 0.3) {
        quality = 'perfect';
      } else if (cutLength > 80 && verticalAngle < 0.6) {
        quality = 'good';
      } else {
        quality = 'poor';
      }

      const newCut: SliceLine = {
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        quality,
      };

      // Add cut effect at midpoint of the cut
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      addCutEffect(midX, midY);

      setCuts(prev => {
        const updatedCuts = [...prev, newCut];
        
        // Check for early completion - 5 perfect cuts
        const perfectCuts = updatedCuts.filter(cut => cut.quality === 'perfect').length;
        if (perfectCuts >= 5) {
          setCompletionReason('perfect');
          setGameEnded(true);
        }
        
        return updatedCuts;
      });
      
      setScore(prev => prev + (quality === 'perfect' ? 100 : quality === 'good' ? 60 : 20));
      setIsSlicing(false);
      setPreviewLine(null); // Clear preview line

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(30);
    setCuts([]);
    setScore(0);
    setGameEnded(false);
    setCompletionReason('time');
    setPreviewLine(null);
    setCutEffects([]);
  };

  const perfectCuts = cuts.filter(cut => cut.quality === 'perfect').length;
  const goodCuts = cuts.filter(cut => cut.quality === 'good').length;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-warrior-leather rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-warrior-gold">Slicing Challenge</h2>
            <p className="text-warrior-light">{cutName}</p>
          </div>
          <Button variant="warrior-ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {!gameStarted ? (
          <div className="text-center space-y-6">
            <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
              <Trophy className="w-16 h-16 text-warrior-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Master the Blade</h3>
                <p className="text-muted-foreground mb-4">
                  Slice the premium {cutName} with precision! Make clean vertical cuts following the guide lines to score maximum points.
                </p>
                <div className="space-y-2 text-sm text-warrior-light">
                  <p>• <span className="text-green-400">Perfect cuts:</span> Long, straight vertical slices = 100 points</p>
                  <p>• <span className="text-orange-400">Good cuts:</span> Decent vertical lines = 60 points</p>
                  <p>• <span className="text-red-400">Poor cuts:</span> Short or crooked cuts = 20 points</p>
                  <p className="mt-2 text-warrior-gold font-semibold">🎯 Master Challenge: Make 5 perfect cuts to finish early!</p>
                  <p className="text-warrior-gold italic">⏱️ Time bonus: +10 points per second remaining</p>
                </div>
            </div>
            <Button variant="warrior" size="lg" onClick={startGame} className="w-full">
              Start Slicing Challenge
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <Badge variant="outline" className="border-warrior-gold text-warrior-gold">
                  <Timer size={14} className="mr-1" />
                  {timeLeft}s
                </Badge>
                <Badge variant="outline" className="border-warrior-ember text-warrior-ember">
                  <Trophy size={14} className="mr-1" />
                  {score}
                </Badge>
                <Badge variant="outline" className="border-warrior-smoke text-warrior-smoke">
                  <Target size={14} className="mr-1" />
                  {cuts.length} cuts ({perfectCuts}/5 perfect)
                </Badge>
              </div>
            </div>

            <div className="relative mb-4">
              {/* Hidden image for canvas drawing */}
              <img 
                ref={imageRef} 
                src={wagyuCuttingBoard} 
                alt="Wagyu meat" 
                style={{ display: 'none' }} 
                onLoad={() => {
                  // Force canvas redraw when image loads
                  const canvas = canvasRef.current;
                  if (canvas && gameStarted) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      const { width, height } = canvas;
                      ctx.clearRect(0, 0, width, height);
                      drawMeatImage(ctx, width, height);
                      if (!gameEnded) {
                        drawGuideLines(ctx, width, height);
                      }
                      drawCuts(ctx);
                      drawPreviewLine(ctx);
                      drawCutEffects(ctx);
                    }
                  }
                }}
              />
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full border-2 border-warrior-gold/30 rounded-lg cursor-crosshair bg-warrior-dark"
                onMouseDown={handleMouseDown}
                style={{
                  cursor: isSlicing ? 'grabbing' : 'crosshair',
                }}
              />
              
              {gameEnded && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                  <div className="text-center warrior-glass p-6 rounded-xl border border-warrior-gold/20 max-w-md">
                    <div className="mb-4">
                      <img 
                        src={yakuzaWarriorEating} 
                        alt="Yakuza warrior enjoying the perfectly sliced wagyu" 
                        className="w-full h-32 object-cover rounded-lg border border-warrior-gold/30"
                      />
                    </div>
                    <Trophy className="w-12 h-12 text-warrior-gold mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-warrior-gold mb-2">
                      {completionReason === 'perfect' ? 'Master Achievement!' : 'Challenge Complete!'}
                    </h3>
                    {completionReason === 'perfect' && (
                      <p className="text-green-400 font-semibold mb-2">🎯 5 Perfect Cuts! Early Completion Bonus!</p>
                    )}
                    <div className="space-y-1 text-sm">
                      <p className="text-green-400">Perfect cuts: {perfectCuts}</p>
                      <p className="text-orange-400">Good cuts: {goodCuts}</p>
                      {completionReason === 'perfect' && timeLeft > 0 && (
                        <p className="text-warrior-gold">Time bonus: +{timeLeft * 10} points ({timeLeft}s)</p>
                      )}
                      <p className="text-warrior-gold font-semibold">Final Score: {calculateFinalScore()}</p>
                    </div>
                    <p className="text-warrior-light text-xs mt-2 italic">The yakuza warrior savors your masterful cuts</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Click and drag vertically to slice the wagyu. Follow the golden guide lines for perfect steaks!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};