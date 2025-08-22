import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Crown, Flame, ChevronRight, Lock, Star } from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen warrior-dark flex items-center justify-center">
        <div className="text-warrior-gold text-xl font-cinzel animate-pulse">Loading the brotherhood...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen warrior-dark relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 warrior-pattern opacity-5" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-warrior-ember/10 via-transparent to-warrior-gold/5" />
          
          {/* Floating Geometric Elements */}
          <div className="absolute top-20 left-10 w-32 h-32 border border-warrior-gold/20 rotate-45 animate-pulse" />
          <div className="absolute bottom-32 right-16 w-24 h-24 border border-warrior-gold/30 rotate-12 animate-pulse delay-700" />
          <div className="absolute top-1/2 left-8 w-16 h-16 border border-warrior-ember/40 rotate-90 animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            {/* Main Logo/Title */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-full bg-warrior-gold/10 border border-warrior-gold/30 backdrop-blur-sm">
                  <Crown className="w-12 h-12 text-warrior-gold" />
                </div>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-cinzel font-bold text-warrior-gold mb-4 tracking-wider">
                <span className="block text-3xl md:text-4xl font-normal text-warrior-light/80 mb-2">The</span>
                WAGYU
                <span className="block text-4xl md:text-5xl font-medium text-warrior-ember">WARRIORS</span>
              </h1>
              
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-warrior-gold to-transparent mx-auto mb-6" />
            </div>

            {/* Exclusive Messaging */}
            <div className="mb-12 space-y-6">
              <p className="text-xl md:text-2xl font-cormorant italic text-warrior-light/90 max-w-2xl mx-auto leading-relaxed">
                "Where culinary mastery meets ancient traditions"
              </p>
              
              <p className="text-lg text-warrior-light/70 max-w-xl mx-auto font-cormorant">
                An invitation-only brotherhood for those who understand that the finest things in life 
                are earned through dedication, respect, and unwavering commitment to excellence.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="group p-6 bg-warrior-leather/20 border border-warrior-gold/20 rounded-lg backdrop-blur-sm hover:bg-warrior-leather/30 transition-all duration-300">
                <Shield className="w-8 h-8 text-warrior-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-cinzel font-semibold text-warrior-gold mb-2">Exclusive Access</h3>
                <p className="text-sm text-warrior-light/70 font-cormorant">Private dining experiences and rare Wagyu tastings</p>
              </div>
              
              <div className="group p-6 bg-warrior-leather/20 border border-warrior-gold/20 rounded-lg backdrop-blur-sm hover:bg-warrior-leather/30 transition-all duration-300">
                <Flame className="w-8 h-8 text-warrior-ember mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-cinzel font-semibold text-warrior-gold mb-2">Master Your Craft</h3>
                <p className="text-sm text-warrior-light/70 font-cormorant">Perfect your technique in our virtual Butcher Kitchen</p>
              </div>
              
              <div className="group p-6 bg-warrior-leather/20 border border-warrior-gold/20 rounded-lg backdrop-blur-sm hover:bg-warrior-leather/30 transition-all duration-300">
                <Star className="w-8 h-8 text-warrior-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-cinzel font-semibold text-warrior-gold mb-2">Elite Network</h3>
                <p className="text-sm text-warrior-light/70 font-cormorant">Connect with fellow connoisseurs in the Cigar Lounge</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-center space-x-2 text-warrior-light/60">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-cormorant">Members Only • By Invitation</span>
                <Lock className="w-4 h-4" />
              </div>
              
              <Link to="/auth" className="group inline-block">
                <Button 
                  variant="warrior" 
                  size="xl"
                  className="relative overflow-hidden group-hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  <span className="relative z-10 flex items-center space-x-2 font-cinzel tracking-wide">
                    <span>REQUEST ENTRY</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-warrior-gold via-warrior-ember to-warrior-gold opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </Button>
              </Link>
              
              <p className="text-xs text-warrior-light/50 font-cormorant italic">
                "Only those who prove their dedication shall be granted passage"
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Element */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warrior-dark via-warrior-dark/50 to-transparent" />
      </div>
    );
  }

  return <MainLayout />;
};

export default Index;
