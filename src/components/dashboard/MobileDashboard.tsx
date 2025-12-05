import { useState } from "react";
import { Users, CheckSquare, Calendar, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GroupCard } from "@/components/shared/GroupCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  due_date: string | null;
  group_id: string;
}

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  location: string | null;
  group_id: string;
}

interface Group {
  id: string;
  name: string;
  subject: string | null;
  deadline: string | null;
  memberCount: number;
  max_members: number;
}

interface MobileDashboardProps {
  groups: Group[];
  tasks: Task[];
  appointments: Appointment[];
  loading: boolean;
  tasksLoading: boolean;
  appointmentsLoading: boolean;
  openTasksCount: number;
  getGroupName: (groupId: string) => string;
}

interface ExpandableCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconBgColor: string;
  iconColor: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  preview?: React.ReactNode;
}

function ExpandableCard({
  icon: Icon,
  value,
  label,
  iconBgColor,
  iconColor,
  isOpen,
  onToggle,
  children,
  preview,
}: ExpandableCardProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className={cn(
        "transition-all duration-300 ease-out overflow-hidden",
        isOpen && "ring-2 ring-primary/20 shadow-lg"
      )}>
        <CollapsibleTrigger className="w-full">
          <div className={cn(
            "flex items-center justify-between p-6 min-h-[100px] transition-colors duration-200",
            isOpen && "bg-muted/30"
          )}>
            <div className="flex items-center gap-5">
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300",
                iconBgColor,
                isOpen && "scale-110"
              )}>
                <Icon className={cn("h-8 w-8", iconColor)} />
              </div>
              <div className="text-left">
                <p className="text-4xl font-bold text-foreground">{value}</p>
                <p className="text-base text-muted-foreground">{label}</p>
              </div>
            </div>
            <ChevronDown className={cn(
              "h-6 w-6 text-muted-foreground transition-transform duration-300 ease-out",
              isOpen && "rotate-180"
            )} />
          </div>
          {/* Preview when collapsed */}
          {!isOpen && preview && (
            <div className="px-6 pb-4 pt-0 border-t border-border/50">
              <div className="pt-3 text-left">
                {preview}
              </div>
            </div>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="px-6 pb-6 pt-0">
            {children}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function MobileDashboard({
  groups,
  tasks,
  appointments,
  loading,
  tasksLoading,
  appointmentsLoading,
  openTasksCount,
  getGroupName,
}: MobileDashboardProps) {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  // Preview components for collapsed state
  const groupsPreview = !loading && groups.length > 0 ? (
    <div className="space-y-1.5">
      {groups.slice(0, 2).map((group) => (
        <div key={group.id} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="truncate text-muted-foreground">{group.name}</span>
          {group.subject && (
            <span className="text-xs text-muted-foreground/70 truncate">• {group.subject}</span>
          )}
        </div>
      ))}
      {groups.length > 2 && (
        <p className="text-xs text-muted-foreground/70">+ {groups.length - 2} weitere</p>
      )}
    </div>
  ) : null;

  const tasksPreview = !tasksLoading && tasks.length > 0 ? (
    <div className="space-y-1.5">
      {tasks.slice(0, 2).map((task) => (
        <div key={task.id} className="flex items-center gap-2 text-sm">
          <span className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
          )} />
          <span className="truncate text-muted-foreground">{task.title}</span>
        </div>
      ))}
      {tasks.length > 2 && (
        <p className="text-xs text-muted-foreground/70">+ {tasks.length - 2} weitere</p>
      )}
    </div>
  ) : null;

  const appointmentsPreview = !appointmentsLoading && appointments.length > 0 ? (
    <div className="space-y-1.5">
      {appointments.slice(0, 2).map((appointment) => (
        <div key={appointment.id} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="truncate text-muted-foreground">{appointment.title}</span>
          <span className="text-xs text-muted-foreground/70 whitespace-nowrap">
            {new Date(appointment.start_time).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
          </span>
        </div>
      ))}
      {appointments.length > 2 && (
        <p className="text-xs text-muted-foreground/70">+ {appointments.length - 2} weitere</p>
      )}
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      {/* Groups Section */}
      <ExpandableCard
        icon={Users}
        value={loading ? "-" : groups.length}
        label="Aktive Gruppen"
        iconBgColor="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600 dark:text-blue-400"
        isOpen={openSection === "groups"}
        onToggle={() => toggleSection("groups")}
        preview={groupsPreview}
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Keine Gruppen"
            description="Erstelle oder tritt einer Gruppe bei"
            action={
              <div className="flex flex-col gap-2 w-full">
                <JoinGroupDialog />
                <CreateGroupDialog />
              </div>
            }
          />
        ) : (
          <div className="space-y-3">
            {groups.slice(0, 5).map((group, index) => (
              <GroupCard
                key={group.id}
                id={group.id}
                colorIndex={index}
                title={group.name}
                subject={group.subject || undefined}
                deadline={group.deadline || undefined}
                memberCount={group.memberCount}
                maxMembers={group.max_members}
                onClick={() => navigate(`/groups/${group.id}`)}
              />
            ))}
            {groups.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                + {groups.length - 5} weitere Gruppen
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <JoinGroupDialog />
              <CreateGroupDialog />
            </div>
          </div>
        )}
      </ExpandableCard>

      {/* Tasks Section */}
      <ExpandableCard
        icon={CheckSquare}
        value={tasksLoading ? "-" : openTasksCount}
        label="Offene Aufgaben"
        iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        isOpen={openSection === "tasks"}
        onToggle={() => toggleSection("tasks")}
        preview={tasksPreview}
      >
        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Keine Aufgaben"
            description="Erstelle Aufgaben in deinen Gruppen"
          />
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <Card
                key={task.id}
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/groups/${task.group_id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{getGroupName(task.group_id)}</p>
                  </div>
                  {task.priority && (
                    <span className={cn("text-xs px-2 py-0.5 rounded-full whitespace-nowrap", getPriorityColor(task.priority))}>
                      {task.priority === "high" ? "Hoch" : task.priority === "medium" ? "Mittel" : "Niedrig"}
                    </span>
                  )}
                </div>
                {task.due_date && (
                  <p className={cn(
                    "text-xs mt-1",
                    new Date(task.due_date) < new Date() ? "text-red-500" : "text-muted-foreground"
                  )}>
                    Fällig: {formatDate(task.due_date)}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </ExpandableCard>

      {/* Appointments Section */}
      <ExpandableCard
        icon={Calendar}
        value={appointmentsLoading ? "-" : appointments.length}
        label="Anstehende Termine"
        iconBgColor="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-600 dark:text-amber-400"
        isOpen={openSection === "appointments"}
        onToggle={() => toggleSection("appointments")}
        preview={appointmentsPreview}
      >
        {appointmentsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Keine Termine"
            description="Plane Termine in deinen Gruppen"
          />
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 5).map((appointment) => (
              <Card
                key={appointment.id}
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/groups/${appointment.group_id}`)}
              >
                <p className="font-medium text-sm">{appointment.title}</p>
                <p className="text-xs text-muted-foreground">{getGroupName(appointment.group_id)}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{formatDate(appointment.start_time)}</span>
                  {appointment.location && <span>📍 {appointment.location}</span>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ExpandableCard>
    </div>
  );
}
