import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Trophy, Timer, Target } from 'lucide-react';

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

interface MarblingPattern {
  x: number;
  y: number;
  size: number;
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
  const [marblingPattern, setMarblingPattern] = useState<MarblingPattern[]>([]);
  const [previewLine, setPreviewLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
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
  }, [gameEnded, gameStarted]);

  const calculateFinalScore = () => {
    const perfectCuts = cuts.filter(cut => cut.quality === 'perfect').length;
    const goodCuts = cuts.filter(cut => cut.quality === 'good').length;
    const poorCuts = cuts.filter(cut => cut.quality === 'poor').length;
    
    return (perfectCuts * 100) + (goodCuts * 60) + (poorCuts * 20);
  };

  // Generate static marbling pattern on game start
  const generateMarblingPattern = useCallback((width: number, height: number) => {
    const pattern: MarblingPattern[] = [];
    for (let i = 0; i < 8; i++) {
      pattern.push({
        x: 80 + Math.random() * (width - 160),
        y: 80 + Math.random() * (height - 160),
        size: 20 + Math.random() * 30,
      });
    }
    setMarblingPattern(pattern);
  }, []);

  const drawMeat = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw meat background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.3, '#CD853F');
    gradient.addColorStop(0.7, '#A0522D');
    gradient.addColorStop(1, '#8B4513');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(50, 50, width - 100, height - 100);
    
    // Draw static marbling pattern only if it exists
    if (marblingPattern.length > 0) {
      ctx.strokeStyle = '#F5DEB3';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
      marblingPattern.forEach(({ x, y, size }) => {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
      });
      
      ctx.globalAlpha = 1;
    }
  }, [marblingPattern]);

  const drawGuideLines = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.5;
    
    // Draw suggested cut lines
    const numLines = 6;
    const spacing = (height - 100) / (numLines + 1);
    
    for (let i = 1; i <= numLines; i++) {
      const y = 50 + spacing * i;
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(width - 60, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }, []);

  const drawCuts = useCallback((ctx: CanvasRenderingContext2D) => {
    cuts.forEach((cut) => {
      ctx.strokeStyle = 
        cut.quality === 'perfect' ? '#00FF00' :
        cut.quality === 'good' ? '#FFA500' : '#FF0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cut.x1, cut.y1);
      ctx.lineTo(cut.x2, cut.y2);
      ctx.stroke();
    });
  }, [cuts]);

  const drawPreviewLine = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!previewLine) return;
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(previewLine.x1, previewLine.y1);
    ctx.lineTo(previewLine.x2, previewLine.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }, [previewLine]);

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
      drawMeat(ctx, width, height);
      if (!gameEnded) {
        drawGuideLines(ctx, width, height);
      }
      drawCuts(ctx);
      drawPreviewLine(ctx);
    }
  }, [gameStarted, cuts, gameEnded, previewLine, marblingPattern, drawMeat, drawGuideLines, drawCuts, drawPreviewLine]);

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
      
      // Evaluate cut quality
      const cutLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      const angle = Math.abs(Math.atan2(endY - startY, endX - startX));
      
      let quality: 'perfect' | 'good' | 'poor';
      if (cutLength > 100 && Math.abs(angle) < 0.2) {
        quality = 'perfect';
      } else if (cutLength > 60 && Math.abs(angle) < 0.5) {
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

      setCuts(prev => [...prev, newCut]);
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
    const canvas = canvasRef.current;
    if (canvas) {
      generateMarblingPattern(canvas.width, canvas.height);
    }
    setGameStarted(true);
    setTimeLeft(30);
    setCuts([]);
    setScore(0);
    setGameEnded(false);
    setPreviewLine(null);
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
                Slice the {cutName} with precision! Follow the golden guide lines for perfect cuts.
              </p>
              <div className="space-y-2 text-sm text-warrior-light">
                <p>• <span className="text-green-400">Perfect cuts:</span> Long, straight lines = 100 points</p>
                <p>• <span className="text-orange-400">Good cuts:</span> Decent lines = 60 points</p>
                <p>• <span className="text-red-400">Poor cuts:</span> Short or angled = 20 points</p>
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
                  {cuts.length} cuts
                </Badge>
              </div>
            </div>

            <div className="relative mb-4">
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="w-full border-2 border-warrior-gold/30 rounded-lg cursor-crosshair bg-warrior-dark"
                onMouseDown={handleMouseDown}
                style={{
                  cursor: isSlicing ? 'grabbing' : 'crosshair',
                }}
              />
              
              {gameEnded && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                  <div className="text-center warrior-glass p-6 rounded-xl border border-warrior-gold/20">
                    <Trophy className="w-12 h-12 text-warrior-gold mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-warrior-gold mb-2">Challenge Complete!</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-green-400">Perfect cuts: {perfectCuts}</p>
                      <p className="text-orange-400">Good cuts: {goodCuts}</p>
                      <p className="text-warrior-gold font-semibold">Final Score: {score}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Click and drag to slice the meat. Follow the golden guide lines for best results!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};