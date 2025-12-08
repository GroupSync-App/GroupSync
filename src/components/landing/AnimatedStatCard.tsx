import { useCountUp } from "@/hooks/useCountUp";
import { LucideIcon } from "lucide-react";

interface AnimatedStatCardProps {
  icon: LucideIcon;
  number: number;
  label: string;
  sublabel: string;
  color: string;
  delay: number;
}

export const AnimatedStatCard = ({ 
  icon: Icon, 
  number, 
  label, 
  sublabel, 
  color, 
  delay 
}: AnimatedStatCardProps) => {
  const { count, ref } = useCountUp({ end: number, duration: 1200 });

  return (
    <div 
      ref={ref}
      className="p-4 md:p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{count}</p>
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{sublabel}</p>
    </div>
  );
};
