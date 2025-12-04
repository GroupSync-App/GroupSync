import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatsCard({ 
  icon: Icon, 
  value, 
  label, 
  iconBgColor = "bg-primary/10", 
  iconColor = "text-primary" 
}: StatsCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", iconBgColor)}>
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
