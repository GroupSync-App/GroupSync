import { Users, CheckSquare, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { GroupCard } from "@/components/shared/GroupCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { useGroups } from "@/hooks/useGroups";
import { useTasks } from "@/hooks/useTasks";
import { useAppointments } from "@/hooks/useAppointments";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";

export default function Dashboard() {
  const navigate = useNavigate();
  const { groups, loading } = useGroups();
  const { tasks, openTasksCount, loading: tasksLoading, error: tasksError } = useTasks();
  const { upcomingAppointments, loading: appointmentsLoading } = useAppointments();

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || "Unbekannte Gruppe";
  };

  // Filter and sort tasks for display
  const displayTasks = tasks
    .filter(t => t.status !== "completed")
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5);

  const displayAppointments = upcomingAppointments.slice(0, 5);

  return (
    <AppLayout>
      <PageContainer>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Dein Überblick über Gruppen, Aufgaben und Termine</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <StatsCard
            icon={Users}
            value={loading ? "-" : groups.length}
            label="Aktive Gruppen"
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatsCard
            icon={CheckSquare}
            value={tasksLoading || tasksError ? "-" : openTasksCount}
            label="Offene Aufgaben"
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatsCard
            icon={Calendar}
            value={appointmentsLoading ? "-" : upcomingAppointments.length}
            label="Anstehende Termine"
            iconBgColor="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>

        {/* Upcoming Section */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <UpcomingAppointments
            appointments={displayAppointments}
            loading={appointmentsLoading || loading}
            getGroupName={getGroupName}
          />
          <UpcomingTasks
            tasks={displayTasks}
            loading={tasksLoading || loading}
            getGroupName={getGroupName}
          />
        </div>

        {/* Groups Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Deine Gruppen</h2>
              <p className="text-sm text-muted-foreground">Verwalte deine Gruppenprojekte und Aufgaben</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <JoinGroupDialog />
              <CreateGroupDialog />
            </div>
          </div>

          {loading ? (
            <Card className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </Card>
          ) : groups.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                icon={Users}
                title="Keine Gruppen vorhanden"
                description="Erstelle deine erste Gruppe und starte die Zusammenarbeit"
                action={<CreateGroupDialog />}
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group, index) => (
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
            </div>
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
