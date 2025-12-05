import { Vote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Poll } from "@/hooks/usePolls";

interface ActivePollsProps {
  polls: Poll[];
  loading: boolean;
  getGroupName: (groupId: string) => string;
}

export function ActivePolls({ polls, loading, getGroupName }: ActivePollsProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Vote className="h-4 w-4 text-purple-500" />
            Aktive Umfragen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Vote className="h-4 w-4 text-purple-500" />
          Aktive Umfragen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {polls.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine aktiven Umfragen
          </p>
        ) : (
          <div className="space-y-3">
            {polls.slice(0, 5).map((poll) => (
              <div
                key={poll.id}
                onClick={() => navigate(`/groups/${poll.group_id}`)}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{poll.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getGroupName(poll.group_id)}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2 shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  Abstimmen
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
