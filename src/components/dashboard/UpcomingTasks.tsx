import { CheckSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  due_date: string | null;
  group_id: string;
}

interface UpcomingTasksProps {
  tasks: Task[];
  loading: boolean;
  getGroupName: (groupId: string) => string;
}

const statusLabels: Record<string, string> = {
  open: "Offen",
  in_progress: "In Bearbeitung",
};

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  high: { label: "Hoch", variant: "destructive" },
  medium: { label: "Mittel", variant: "outline", className: "border-warning text-warning bg-warning/10" },
  low: { label: "Niedrig", variant: "secondary" },
};

export function UpcomingTasks({ tasks, loading, getGroupName }: UpcomingTasksProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Aktuelle Aufgaben
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Aktuelle Aufgaben
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Keine Aufgaben"
            description="Du hast keine offenen Aufgaben"
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/groups/${task.group_id}`)}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{getGroupName(task.group_id)}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {task.priority && priorityConfig[task.priority] && (
                      <Badge variant={priorityConfig[task.priority].variant} className={`text-xs ${priorityConfig[task.priority].className || ""}`}>
                        {priorityConfig[task.priority].label}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {statusLabels[task.status] || task.status}
                  </Badge>
                  {task.due_date && (
                    <span className={`flex items-center gap-1 ${isPast(new Date(task.due_date)) ? "text-destructive" : ""}`}>
                      <Clock className="h-3 w-3" />
                      {format(new Date(task.due_date), "dd. MMM yyyy", { locale: de })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
