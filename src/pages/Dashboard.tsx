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
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { groups, loading } = useGroups();
  const { openTasksCount, loading: tasksLoading, error: tasksError } = useTasks();

  return (
    <AppLayout>
      <PageContainer>
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
            value="-"
            label="Anstehende Termine"
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
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