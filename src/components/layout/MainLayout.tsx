import { ReactNode, useState } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { WarriorProfile } from "@/components/warrior/WarriorProfile";
import { ButcherStudio } from "@/components/studio/ButcherStudio";
import { ChefsTable } from "@/components/social/ChefsTable";
import { CigarLounge } from "@/components/lounge/CigarLounge";
import { EventsPage } from "@/components/events/EventsPage";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <WarriorProfile onEditProfile={() => console.log("Edit profile")} />;
      case "butcher":
        return <ButcherStudio />;
      case "table":
        return <ChefsTable />;
      case "lounge":
        return <CigarLounge />;
      case "events":
        return <EventsPage />;
      default:
        return <WarriorProfile onEditProfile={() => console.log("Edit profile")} />;
    }
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <header className="warrior-glass border-b border-warrior-gold/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 warrior-gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-warrior-dark font-bold text-lg">和</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Wagyu Warriors</h1>
                <p className="text-xs text-muted-foreground">Elite Culinary Society</p>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warrior-gold rounded-full animate-warrior-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="animate-fade-in-up">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};