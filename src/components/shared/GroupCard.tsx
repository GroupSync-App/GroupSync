import { Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const gradientColors = [
  "from-cyan-500 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-green-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-blue-500",
];

interface GroupCardProps {
  id?: string | number;
  title: string;
  subject?: string;
  deadline?: string;
  memberCount: number;
  maxMembers: number;
  className?: string;
  onClick?: () => void;
}

export function GroupCard({
  id = 0,
  title,
  subject,
  deadline,
  memberCount,
  maxMembers,
  className,
  onClick,
}: GroupCardProps) {
  const isFull = memberCount >= maxMembers;
  const colorIndex = typeof id === "string" 
    ? id.charCodeAt(0) % gradientColors.length 
    : Number(id) % gradientColors.length;
  const gradientClass = gradientColors[colorIndex];

  return (
    <Card
      className={cn(
        "cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-medium hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <div className={cn("h-2 bg-gradient-to-r", gradientClass)} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-foreground line-clamp-2">
            {title}
          </h3>
          {isFull && (
            <Badge variant="secondary" className="shrink-0">
              Voll
            </Badge>
          )}
        </div>
        {subject && (
          <p className="text-sm text-muted-foreground mb-3">{subject}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>
              {memberCount}/{maxMembers}
            </span>
          </div>
          {deadline && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{deadline}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
