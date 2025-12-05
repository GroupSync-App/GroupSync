import { Calendar, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO } from "date-fns";

const gradientColors = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-blue-500",
];

interface GroupCardProps {
  id?: string | number;
  colorIndex?: number;
  title: string;
  subject?: string;
  deadline?: string;
  memberCount: number;
  maxMembers: number;
  className?: string;
  onClick?: () => void;
}

const getDeadlineInfo = (deadline: string) => {
  const daysLeft = differenceInDays(parseISO(deadline), new Date());
  
  if (daysLeft < 0) {
    return { text: "Abgelaufen", color: "text-destructive" };
  }
  if (daysLeft <= 7) {
    return { text: `${daysLeft} Tage`, color: "text-destructive" };
  }
  if (daysLeft <= 14) {
    return { text: `${daysLeft} Tage`, color: "text-warning" };
  }
  return { text: `${daysLeft} Tage`, color: "text-muted-foreground" };
};

export function GroupCard({
  id = 0,
  colorIndex,
  title,
  subject,
  deadline,
  memberCount,
  maxMembers,
  className,
  onClick,
}: GroupCardProps) {
  const isFull = memberCount >= maxMembers;
  const calculatedColorIndex = colorIndex !== undefined 
    ? colorIndex % gradientColors.length 
    : typeof id === "string" 
      ? id.charCodeAt(0) % gradientColors.length 
      : Number(id) % gradientColors.length;
  const gradientClass = gradientColors[calculatedColorIndex];
  
  const deadlineInfo = deadline ? getDeadlineInfo(deadline) : null;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-medium hover:-translate-y-1 h-full flex flex-col",
        className
      )}
    >
      <div className={cn("h-2 bg-gradient-to-r shrink-0", gradientClass)} />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
          {isFull && (
            <Badge variant="secondary" className="shrink-0">
              Voll
            </Badge>
          )}
        </div>
        {subject && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{subject}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>
              {memberCount}/{maxMembers}
            </span>
          </div>
          {deadline && deadlineInfo && (
            <div className={cn("flex items-center gap-1.5", deadlineInfo.color)}>
              <Calendar className="h-4 w-4" />
              <span>{deadlineInfo.text}</span>
            </div>
          )}
        </div>
        <div className="mt-auto">
          <Button 
            variant="ghost" 
            className="w-full bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-primary"
            onClick={onClick}
          >
            Gruppe öffnen
          </Button>
        </div>
      </div>
    </Card>
  );
}
