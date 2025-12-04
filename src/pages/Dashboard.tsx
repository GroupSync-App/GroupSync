import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/shared/GroupCard";
import { EmptyState } from "@/components/shared/EmptyState";

// Placeholder data for UI demonstration
const mockGroups = [
  {
    id: "1",
    title: "Webentwicklung Projekt",
    subject: "Informatik",
    deadline: "15. Jan 2025",
    memberCount: 3,
    maxMembers: 5,
  },
  {
    id: "2",
    title: "Marketing Kampagne",
    subject: "BWL",
    deadline: "20. Jan 2025",
    memberCount: 4,
    maxMembers: 4,
  },
  {
    id: "3",
    title: "Statistik Hausarbeit",
    subject: "Mathematik",
    deadline: "28. Jan 2025",
    memberCount: 2,
    maxMembers: 6,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const groups = mockGroups; // Will be replaced with real data in Phase 4
  const showEmptyState = false; // Toggle for demonstration

  return (
    <AppLayout>
      <PageContainer>
        <PageTitle
          subtitle="Alle deine Gruppenarbeiten auf einen Blick"
          action={
            <Button onClick={() => {}}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Gruppe
            </Button>
          }
        >
          Meine Gruppen
        </PageTitle>

        {showEmptyState ? (
          <EmptyState
            icon={Users}
            title="Noch keine Gruppen"
            description="Erstelle deine erste Gruppe oder tritt einer bestehenden bei."
            action={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Gruppe erstellen
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                title={group.title}
                subject={group.subject}
                deadline={group.deadline}
                memberCount={group.memberCount}
                maxMembers={group.maxMembers}
                onClick={() => navigate(`/groups/${group.id}`)}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
}
