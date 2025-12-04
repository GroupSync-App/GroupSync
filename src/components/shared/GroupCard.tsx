import { Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  title: string;
  subject?: string;
  deadline?: string;
  memberCount: number;
  maxMembers: number;
  className?: string;
  onClick?: () => void;
}

export function GroupCard({
  title,
  subject,
  deadline,
  memberCount,
  maxMembers,
  className,
  onClick,
}: GroupCardProps) {
  const isFull = memberCount >= maxMembers;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold text-foreground line-clamp-2">
            {title}
          </CardTitle>
          {isFull && (
            <Badge variant="secondary" className="shrink-0">
              Voll
            </Badge>
          )}
        </div>
        {subject && (
          <p className="text-sm text-muted-foreground">{subject}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
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
      </CardContent>
    </Card>
  );
}
