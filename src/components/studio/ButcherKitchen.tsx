import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Play, RotateCcw, Save } from "lucide-react";
import yakuzaKitchenOven from "@/assets/yakuza-kitchen-oven.jpg";
import wagyuHero from "@/assets/wagyu-hero.jpg";
import { SlicingGame } from "./SlicingGame";
import { SearingGame } from "./SearingGame";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const primalCuts = [
  { id: "ribeye", name: "Ribeye A5", grade: "Prime", color: "warrior-ember" },
  { id: "strip", name: "NY Strip", grade: "Choice", color: "warrior-gold" },
  { id: "tenderloin", name: "Tenderloin", grade: "Prime", color: "warrior-smoke" },
  { id: "picanha", name: "Picanha", grade: "Select", color: "warrior-leather" },
];

export const ButcherKitchen: React.FC = () => {
  const { user } = useAuth();
  const [selectedCut, setSelectedCut] = useState<string | null>(null);
  const [sliceScore, setSliceScore] = useState(0);
  const [showSearingGame, setShowSearingGame] = useState(false);
  const [showSlicingGame, setShowSlicingGame] = useState(false);
  const [totalCuts, setTotalCuts] = useState(0);
  const [searingCompleted, setSearingCompleted] = useState(false);
  const [searingScore, setSearingScore] = useState(0);
  const [searingTechnique, setSearingTechnique] = useState('');

  const handleStartSlicing = () => {
    if (!selectedCut) return;
    setSearingCompleted(false);
    setSearingScore(0);
    setSearingTechnique('');
    setShowSearingGame(true);
  };

  const handleSearingComplete = (score: number, technique: string) => {
    setSearingScore(score);
    setSearingTechnique(technique);
    setSearingCompleted(true);
    setShowSearingGame(false);
    setShowSlicingGame(true);
  };

  const handleGameComplete = (score: number, cuts: number) => {
    setSliceScore(score);
    setTotalCuts(cuts);
    setShowSlicingGame(false);
    // Save the complete cooking session when both games are done
    setTimeout(() => {
      saveCookingSession();
    }, 100);
  };

  const handleCloseGame = () => {
    setShowSlicingGame(false);
    setShowSearingGame(false);
  };

  const resetAllGames = () => {
    setSelectedCut(null);
    setSliceScore(0);
    setTotalCuts(0);
    setSearingScore(0);
    setSearingTechnique('');
    setSearingCompleted(false);
  };

  const saveCookingSession = async () => {
    if (!user || !selectedCut || !searingScore || !sliceScore) {
      console.log('Cannot save cooking session:', { 
        hasUser: !!user, 
        selectedCut, 
        searingScore, 
        sliceScore 
      });
      return;
    }

    try {
      const cutData = primalCuts.find(c => c.id === selectedCut);
      const totalScore = searingScore + sliceScore;

      console.log('Saving cooking session:', {
        user_id: user.id,
        cut_type: selectedCut,
        cut_name: cutData?.name || '',
        searing_score: searingScore,
        searing_technique: searingTechnique,
        slicing_score: sliceScore,
        total_cuts: totalCuts,
        total_score: totalScore
      });

      const { error } = await supabase
        .from('cooking_sessions')
        .insert({
          user_id: user.id,
          cut_type: selectedCut,
          cut_name: cutData?.name || '',
          searing_score: searingScore,
          searing_technique: searingTechnique,
          slicing_score: sliceScore,
          total_cuts: totalCuts,
          total_score: totalScore
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Cooking session saved successfully!');
      toast.success("Cooking session saved! Your stats have been updated.");
    } catch (error: any) {
      console.error('Error saving cooking session:', error);
      toast.error("Failed to save cooking session");
    }
  };

  const isGameComplete = sliceScore > 0 && searingScore > 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <div className="flex items-center justify-between mb-4">
          {/* Left side - Butcher Kitchen block */}
          <div className="flex items-center space-x-3">
            <ChefHat className="text-warrior-gold" size={24} />
            <div>
              <h2 className="text-xl font-bold text-foreground">Butcher Kitchen</h2>
              <p className="text-sm text-muted-foreground">Master the art of the blade</p>
            </div>
          </div>
          
          {/* Center - Kitchen Protocol */}
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <p className="text-sm text-warrior-gold font-semibold underline decoration-warrior-gold/50 underline-offset-2 mb-2">Kitchen Protocol:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1: Select your meat</p>
                <p>2: Cook to perfection</p>
                <p>3: Slice for best presentation</p>
              </div>
            </div>
          </div>
          
          {/* Right side - empty spacer to balance layout */}
          <div className="w-[200px]"></div>
        </div>

        {(sliceScore > 0 || searingScore > 0) && (
          <div className="mb-4 flex gap-2 flex-wrap">
            {searingScore > 0 && (
              <Badge variant="outline" className="border-warrior-ember text-warrior-ember bg-warrior-ember/10">
                Searing: {searingScore} ({searingTechnique})
              </Badge>
            )}
            {sliceScore > 0 && (
              <>
                <Badge variant="outline" className="border-warrior-gold text-warrior-gold bg-warrior-gold/10">
                  Slicing: {sliceScore} points
                </Badge>
                <Badge variant="outline" className="border-warrior-smoke text-warrior-smoke bg-warrior-smoke/10">
                  Cuts: {totalCuts}
                </Badge>
              </>
            )}
          </div>
        )}
      </div>

      {!isGameComplete && (
        <>
          {/* Primal Selection with Background Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Select Your Cut</h3>
            <div 
              className="relative rounded-xl overflow-hidden"
              style={{
                backgroundImage: `url(${wagyuHero})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Dark overlay for better button visibility */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
              
              <div className="relative z-10 p-6 grid grid-cols-2 gap-3">
                {primalCuts.map((cut) => (
                  <button
                    key={cut.id}
                    onClick={() => setSelectedCut(cut.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                      selectedCut === cut.id
                        ? "border-warrior-gold bg-warrior-gold/20 warrior-shadow-gold"
                        : "border-white/30 bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <div className="text-left">
                      <h4 className="font-semibold text-white">{cut.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`mt-2 text-xs ${
                          selectedCut === cut.id 
                            ? `border-${cut.color}/50 text-${cut.color}` 
                            : 'border-white/50 text-white bg-white/10'
                        }`}
                      >
                        {cut.grade}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
              
              {selectedCut && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 warrior-gradient-gold rounded-full flex items-center justify-center mb-4 mx-auto">
                      <ChefHat size={24} className="text-warrior-dark" />
                    </div>
                    <p className="text-white font-medium text-lg shadow-lg">
                      {primalCuts.find(c => c.id === selectedCut)?.name} Ready
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Knife Tools */}
          <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
            <h4 className="font-semibold text-foreground mb-4">Master's Toolkit</h4>
            
            <div className="flex items-center justify-center mb-6">
              <img
                src={yakuzaKitchenOven}
                alt="Yakuza Kitchen Oven"
                className="w-32 h-24 object-cover rounded-lg warrior-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="warrior"
                size="lg"
                onClick={handleStartSlicing}
                disabled={!selectedCut}
                className="w-full"
              >
                <Play size={16} />
                Lets Cook this Meat
              </Button>
              
              <Button
                variant="warrior-outline"
                size="lg"
                onClick={resetAllGames}
                className="w-full"
              >
                <RotateCcw size={16} />
                Reset
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Results Screen */}
      {isGameComplete && (
        <div className="warrior-glass rounded-xl p-8 border border-warrior-gold/20 text-center">
          <div className="mb-6">
            <ChefHat className="w-16 h-16 text-warrior-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-warrior-gold mb-2">Master Chef Complete!</h2>
            <p className="text-lg text-foreground mb-4">
              {primalCuts.find(c => c.id === selectedCut)?.name} Preparation Mastered
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="warrior-glass rounded-lg p-4 border border-warrior-ember/30">
              <h3 className="text-warrior-ember font-semibold mb-2">Searing Challenge</h3>
              <p className="text-2xl font-bold text-warrior-ember">{searingScore}</p>
              <p className="text-sm text-warrior-ember/80">{searingTechnique}</p>
            </div>
            <div className="warrior-glass rounded-lg p-4 border border-warrior-gold/30">
              <h3 className="text-warrior-gold font-semibold mb-2">Slicing Master</h3>
              <p className="text-2xl font-bold text-warrior-gold">{sliceScore} pts</p>
              <p className="text-sm text-warrior-gold/80">{totalCuts} precise cuts</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="warrior-glass rounded-lg p-4 border border-warrior-smoke/30">
              <h3 className="text-warrior-smoke font-semibold mb-2">Total Score</h3>
              <p className="text-3xl font-bold text-foreground">{searingScore + sliceScore}</p>
            </div>
          </div>

          <Button
            variant="warrior"
            size="lg"
            onClick={() => {
              resetAllGames();
              // Scroll to top for better UX
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full"
          >
            <Play size={16} />
            Do Another Cut
          </Button>
        </div>
      )}

      {/* Technique Tips */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <h4 className="font-semibold text-foreground mb-3">Master's Wisdom</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• <span className="text-warrior-ember">Perfect the sear</span> - control heat and timing</p>
          <p>• <span className="text-warrior-gold">Slice against the grain</span> for maximum tenderness</p>
          <p>• Let the knife do the work - apply gentle pressure</p>
          <p>• Honor the marbling with precise technique</p>
          <p>• <span className="text-warrior-smoke">Rest the meat</span> to retain precious juices</p>
        </div>
      </div>

      {/* Searing Game Modal */}
      {showSearingGame && selectedCut && (
        <SearingGame
          cutType={selectedCut}
          cutName={primalCuts.find(c => c.id === selectedCut)?.name || ''}
          onComplete={handleSearingComplete}
          onClose={handleCloseGame}
        />
      )}

      {/* Slicing Game Modal */}
      {showSlicingGame && selectedCut && (
        <SlicingGame
          cutType={selectedCut}
          cutName={primalCuts.find(c => c.id === selectedCut)?.name || ''}
          onComplete={handleGameComplete}
          onClose={handleCloseGame}
        />
      )}
    </div>
  );
};