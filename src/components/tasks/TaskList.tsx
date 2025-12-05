import { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle, Trash2, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onUpdateStatus?: (taskId: string, status: Task["status"]) => Promise<{ error: unknown }>;
  onDeleteTask?: (taskId: string) => Promise<{ error: unknown }>;
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

type StatusFilter = "all" | Task["status"];

export function TaskList({ tasks, loading, error, onCreateTask, onUpdateStatus, onDeleteTask }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const cycleStatus = async (task: Task) => {
    if (!onUpdateStatus) return;
    
    const statusOrder: Task["status"][] = ["open", "in_progress", "completed"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    await onUpdateStatus(task.id, nextStatus);
  };

  const handleDelete = async (taskId: string) => {
    if (!onDeleteTask) return;
    await onDeleteTask(taskId);
  };

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

  const filteredTasks = statusFilter === "all" 
    ? tasks 
    : tasks.filter((t) => t.status === statusFilter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base">Aufgaben</CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
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
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Alle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="completed">Erledigt</SelectItem>
              </SelectContent>
            </Select>
            {onCreateTask && <CreateTaskDialog onCreateTask={onCreateTask} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Aufgaben vorhanden.
          </p>
        ) : filteredTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Aufgaben mit diesem Status.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const status = statusConfig[task.status];
              const priority = priorityConfig[task.priority];
              const StatusIcon = status.icon;

              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => cycleStatus(task)}
                    className={`mt-0.5 hover:scale-110 transition-transform ${onUpdateStatus ? "cursor-pointer" : "cursor-default"}`}
                    disabled={!onUpdateStatus}
                    title={onUpdateStatus ? `Status ändern zu: ${statusConfig[["open", "in_progress", "completed"][(["open", "in_progress", "completed"].indexOf(task.status) + 1) % 3] as Task["status"]].label}` : undefined}
                  >
                    <StatusIcon className={`h-5 w-5 ${status.color}`} />
                  </button>
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
                  {(onUpdateStatus || onDeleteTask) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onUpdateStatus && (
                          <>
                            <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "open")}>
                              <Circle className="h-4 w-4 mr-2" />
                              Als offen markieren
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "in_progress")}>
                              <Clock className="h-4 w-4 mr-2 text-amber-500" />
                              In Bearbeitung
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "completed")}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                              Als erledigt markieren
                            </DropdownMenuItem>
                          </>
                        )}
                        {onUpdateStatus && onDeleteTask && <DropdownMenuSeparator />}
                        {onDeleteTask && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(task.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}