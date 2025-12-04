import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageTitle } from "@/components/layout/PageTitle";
import { GroupCard } from "@/components/shared/GroupCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { useGroups } from "@/hooks/useGroups";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function Dashboard() {
  const navigate = useNavigate();
  const { groups, loading } = useGroups();

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return undefined;
    try {
      return format(new Date(deadline), "d. MMM yyyy", { locale: de });
    } catch {
      return undefined;
    }
  };

  return (
    <AppLayout>
      <PageContainer>
        <PageTitle
          subtitle="Alle deine Gruppenarbeiten auf einen Blick"
          action={
            <div className="flex gap-2">
              <JoinGroupDialog />
              <CreateGroupDialog />
            </div>
          }
        >
          Meine Gruppen
        </PageTitle>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Noch keine Gruppen"
            description="Erstelle deine erste Gruppe oder tritt einer bestehenden bei."
            action={<CreateGroupDialog />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                title={group.name}
                subject={group.subject || undefined}
                deadline={formatDeadline(group.deadline)}
                memberCount={group.memberCount}
                maxMembers={group.max_members}
                onClick={() => navigate(`/groups/${group.id}`)}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
}
