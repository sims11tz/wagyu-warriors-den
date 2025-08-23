import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Wine, Zap } from "lucide-react";

interface Drink {
  id: number;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  alcohol_content: number | null;
  flavor_profile: string | null;
  price: number | null;
}

interface YakuzaRobotProps {
  onOrderDrink: (drinkId: number) => void;
  isVisible?: boolean;
}

export const YakuzaRobot = ({ onOrderDrink, isVisible = true }: YakuzaRobotProps) => {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setDrinks(data || []);
    } catch (error) {
      console.error('Error fetching drinks:', error);
      toast({
        title: "Error",
        description: "Failed to load drink menu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderDrink = (drink: Drink) => {
    onOrderDrink(drink.id);
    toast({
      title: "Order Placed!",
      description: `${drink.name} has been ordered. The robot will prepare it shortly.`
    });
  };

  const categories = ['all', ...Array.from(new Set(drinks.map(d => d.category)))];
  const filteredDrinks = selectedCategory === 'all' 
    ? drinks 
    : drinks.filter(d => d.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-warrior-gold/20 text-warrior-gold';
      case 'hard': return 'bg-warrior-ember/20 text-warrior-ember';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="warrior-glass border-warrior-ember/30 bg-warrior-ember/5">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-warrior-ember/20 flex items-center justify-center">
            <Bot className="text-warrior-ember" size={24} />
          </div>
          <div>
            <CardTitle className="text-warrior-ember flex items-center space-x-2">
              <Zap size={16} />
              <span>Yakuza Bartender V2.0</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              "Welcome, honored guests. May I serve you a drink?"
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Robot Avatar & Status */}
        <div className="text-center p-4 bg-warrior-leather/10 rounded-lg">
          <div className="text-4xl mb-2">🤖</div>
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-warrior-ember font-medium">Online & Ready</span>
          </div>
        </div>

        {/* Order Menu Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="warrior" className="w-full">
              <Wine className="mr-2" size={16} />
              Order Drink
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Bot className="text-warrior-ember" size={20} />
                <span>Yakuza Bar Menu</span>
              </DialogTitle>
            </DialogHeader>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-warrior-gold">Loading menu...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "warrior" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Drinks Grid */}
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {filteredDrinks.map((drink) => (
                    <Card 
                      key={drink.id} 
                      className="warrior-glass border-warrior-gold/30 cursor-pointer hover:border-warrior-gold/60 transition-colors"
                      onClick={() => handleOrderDrink(drink)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-foreground">{drink.name}</h4>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className={`text-xs ${getDifficultyColor(drink.difficulty)}`}>
                              {drink.difficulty}
                            </Badge>
                            {drink.price && (
                              <Badge variant="secondary" className="text-xs">
                                ¥{drink.price}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {drink.description && (
                          <p className="text-sm text-muted-foreground mb-2">{drink.description}</p>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{drink.flavor_profile}</span>
                          <span>{drink.alcohol_content}% ABV</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Robot Dialogue */}
        <div className="bg-warrior-leather/5 rounded-lg p-3 text-sm">
          <div className="text-warrior-ember font-medium mb-1">Bartender says:</div>
          <div className="text-muted-foreground italic">
            "Each drink has been carefully selected to complement your cigar experience. 
            Choose wisely, and I shall prepare it with precision."
          </div>
        </div>
      </CardContent>
    </Card>
  );
};