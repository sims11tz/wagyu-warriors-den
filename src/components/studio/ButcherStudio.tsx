import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Play, RotateCcw, Save } from "lucide-react";
import butcherKnife from "@/assets/butcher-knife.jpg";
import wagyuHero from "@/assets/wagyu-hero.jpg";

const primalCuts = [
  { id: "ribeye", name: "Ribeye A5", grade: "Prime", color: "warrior-ember" },
  { id: "strip", name: "NY Strip", grade: "Choice", color: "warrior-gold" },
  { id: "tenderloin", name: "Tenderloin", grade: "Prime", color: "warrior-smoke" },
  { id: "picanha", name: "Picanha", grade: "Select", color: "warrior-leather" },
];

export const ButcherStudio: React.FC = () => {
  const [selectedCut, setSelectedCut] = useState<string | null>(null);
  const [isSlicing, setIsSlicing] = useState(false);
  const [sliceScore, setSliceScore] = useState(0);

  const handleStartSlicing = () => {
    if (!selectedCut) return;
    setIsSlicing(true);
    
    // Simulate slicing scoring
    setTimeout(() => {
      setSliceScore(Math.floor(Math.random() * 100) + 850);
      setIsSlicing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <div className="flex items-center space-x-3 mb-4">
          <ChefHat className="text-warrior-gold" size={24} />
          <div>
            <h2 className="text-xl font-bold text-foreground">Butcher Studio</h2>
            <p className="text-sm text-muted-foreground">Master the art of the blade</p>
          </div>
        </div>

        {sliceScore > 0 && (
          <div className="mb-4">
            <Badge variant="outline" className="border-warrior-gold text-warrior-gold bg-warrior-gold/10">
              Last Score: {sliceScore} points
            </Badge>
          </div>
        )}
      </div>

      {/* Primal Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Select Your Cut</h3>
        <div className="grid grid-cols-2 gap-3">
          {primalCuts.map((cut) => (
            <button
              key={cut.id}
              onClick={() => setSelectedCut(cut.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedCut === cut.id
                  ? "border-warrior-gold bg-warrior-gold/10 warrior-shadow-gold"
                  : "border-warrior-smoke/30 bg-warrior-leather/20"
              }`}
            >
              <div className="text-left">
                <h4 className="font-semibold text-foreground">{cut.name}</h4>
                <Badge 
                  variant="outline" 
                  className={`mt-2 text-xs border-${cut.color}/50 text-${cut.color}`}
                >
                  {cut.grade}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cutting Board */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <div className="relative">
          <img
            src={wagyuHero}
            alt="Wagyu Cutting Board"
            className="w-full h-48 object-cover rounded-lg"
          />
          
          {selectedCut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 warrior-gradient-gold rounded-full flex items-center justify-center mb-4 mx-auto">
                  <ChefHat size={24} className="text-warrior-dark" />
                </div>
                <p className="text-white font-medium">
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
            src={butcherKnife}
            alt="Premium Knife"
            className="w-32 h-24 object-cover rounded-lg warrior-shadow"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="warrior"
            size="lg"
            onClick={handleStartSlicing}
            disabled={!selectedCut || isSlicing}
            className="w-full"
          >
            {isSlicing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-warrior-dark border-t-transparent rounded-full mr-2" />
                Slicing...
              </>
            ) : (
              <>
                <Play size={16} />
                Start Cut
              </>
            )}
          </Button>
          
          <Button
            variant="warrior-outline"
            size="lg"
            onClick={() => {
              setSelectedCut(null);
              setSliceScore(0);
            }}
            className="w-full"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>

        {sliceScore > 0 && (
          <Button
            variant="warrior-ghost"
            size="lg"
            className="w-full mt-3"
          >
            <Save size={16} />
            Save to Chef's Table
          </Button>
        )}
      </div>

      {/* Technique Tips */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <h4 className="font-semibold text-foreground mb-3">Master's Wisdom</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Cut against the grain for maximum tenderness</p>
          <p>• Maintain consistent thickness for even cooking</p>
          <p>• Let the knife do the work - apply gentle pressure</p>
          <p>• Honor the marbling with precise cuts</p>
        </div>
      </div>
    </div>
  );
};