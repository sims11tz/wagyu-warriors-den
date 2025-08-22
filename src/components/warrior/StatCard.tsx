import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: "gold" | "ember" | "smoke";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "gold",
  className,
}) => {
  const colorClasses = {
    gold: "border-warrior-gold/30 warrior-shadow-gold",
    ember: "border-warrior-ember/30 warrior-shadow-ember",
    smoke: "border-warrior-smoke/50 shadow-lg",
  };

  const iconColors = {
    gold: "text-warrior-gold",
    ember: "text-warrior-ember", 
    smoke: "text-warrior-smoke",
  };

  return (
    <div className={cn(
      "warrior-glass rounded-xl p-4 border",
      colorClasses[color],
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={cn(
          "p-3 rounded-full warrior-gradient-leather",
          iconColors[color]
        )}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};