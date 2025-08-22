import { useState } from "react";
import { User, ChefHat, Utensils, Cigarette, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "profile", icon: User, label: "Profile", color: "text-warrior-gold" },
  { id: "butcher", icon: ChefHat, label: "Kitchen", color: "text-warrior-ember" },
  { id: "table", icon: Utensils, label: "Table", color: "text-warrior-gold" },
  { id: "lounge", icon: Cigarette, label: "Lounge", color: "text-warrior-smoke" },
  { id: "events", icon: Calendar, label: "Events", color: "text-warrior-gold" },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 warrior-glass border-t border-warrior-gold/20">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300",
                isActive
                  ? "bg-warrior-gold/20 text-warrior-gold transform scale-110"
                  : "text-muted-foreground hover:text-warrior-gold hover:bg-warrior-gold/10"
              )}
            >
              <Icon size={20} className={cn(
                "transition-all duration-300",
                isActive && "animate-warrior-pulse"
              )} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 rounded-full bg-warrior-gold animate-warrior-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};