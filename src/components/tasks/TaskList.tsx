import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "@/hooks/useTasks";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  onCreateTask?: (task: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    due_date?: string;
  }) => Promise<void>;
}

const priorityConfig = {
  low: { label: "Niedrig", variant: "secondary" as const },
  medium: { label: "Mittel", variant: "default" as const },
  high: { label: "Hoch", variant: "destructive" as const },
};

const statusConfig = {
  open: { label: "Offen", icon: Circle, color: "text-muted-foreground" },
  in_progress: { label: "In Bearbeitung", icon: Clock, color: "text-amber-500" },
  completed: { label: "Erledigt", icon: CheckCircle2, color: "text-emerald-500" },
};

export function TaskList({ tasks, loading, error, onCreateTask }: TaskListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aufgaben</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aufgaben</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Aufgaben konnten nicht geladen werden.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const openTasks = tasks.filter((t) => t.status === "open");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Aufgaben</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Circle className="h-3 w-3" /> {openTasks.length}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" /> {inProgressTasks.length}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {completedTasks.length}
            </span>
            </div>
            {onCreateTask && <CreateTaskDialog onCreateTask={onCreateTask} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Aufgaben vorhanden.
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const status = statusConfig[task.status];
              const priority = priorityConfig[task.priority];
              const StatusIcon = status.icon;

              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <StatusIcon className={`h-5 w-5 mt-0.5 ${status.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      <Badge variant={priority.variant} className="text-xs">
                        {priority.label}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Fällig: {format(new Date(task.due_date), "d. MMM yyyy", { locale: de })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
