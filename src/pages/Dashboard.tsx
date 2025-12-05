import { useEffect, useState } from "react";
import { Users, CheckSquare, Calendar, Vote } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Poll } from "@/hooks/usePolls";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { ActivePolls } from "@/components/dashboard/ActivePolls";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, loading } = useGroups();
  const { tasks, openTasksCount, loading: tasksLoading, error: tasksError } = useTasks();
  const { upcomingAppointments, loading: appointmentsLoading } = useAppointments();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [pollsLoading, setPollsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Fetch active polls across all groups with options and votes
  const fetchPolls = async () => {
    if (!user || groups.length === 0) {
      setPollsLoading(false);
      return;
    }

    try {
      const groupIds = groups.map(g => g.id);
      const { data: pollsData } = await supabase
        .from("polls")
        .select("*")
        .in("group_id", groupIds)
        .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`);

      // Fetch options and votes for each poll
      const pollsWithDetails = await Promise.all(
        (pollsData || []).map(async (poll) => {
          const { data: optionsData } = await supabase
            .from("poll_options")
            .select("*")
            .eq("poll_id", poll.id);

          const { data: votesData } = await supabase
            .from("poll_votes")
            .select("*")
            .eq("poll_id", poll.id);

          const optionsWithCounts = (optionsData || []).map((option) => ({
            ...option,
            vote_count: (votesData || []).filter((v) => v.option_id === option.id).length,
          }));

          const userVotes = (votesData || [])
            .filter((v) => v.user_id === user.id)
            .map((v) => v.option_id);

          return {
            ...poll,
            options: optionsWithCounts,
            user_votes: userVotes,
            total_votes: (votesData || []).length,
          };
        })
      );

      setActivePolls(pollsWithDetails as Poll[]);
    } catch (err) {
      console.error("Error fetching polls:", err);
    } finally {
      setPollsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchPolls();
    }
  }, [user, groups, loading]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      if (data?.display_name) {
        setDisplayName(data.display_name);
      }
    };
    fetchProfile();
  }, [user]);

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || "Unbekannte Gruppe";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Guten Morgen";
    if (hour < 18) return "Guten Tag";
    return "Guten Abend";
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}{displayName ? `, ${displayName}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">Dein Überblick über Gruppen, Aufgaben und Termine</p>
        </div>

        {isMobile ? (
          <MobileDashboard
            groups={groups}
            tasks={displayTasks}
            appointments={displayAppointments}
            polls={activePolls}
            loading={loading}
            tasksLoading={tasksLoading}
            appointmentsLoading={appointmentsLoading}
            pollsLoading={pollsLoading}
            openTasksCount={openTasksCount}
            getGroupName={getGroupName}
          />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-4 mb-8">
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
              <StatsCard
                icon={Vote}
                value={pollsLoading ? "-" : activePolls.length}
                label="Aktive Umfragen"
                iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                iconColor="text-purple-600 dark:text-purple-400"
              />
            </div>

            {/* Upcoming Section */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
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
              <ActivePolls
                polls={activePolls}
                loading={pollsLoading || loading}
                getGroupName={getGroupName}
                onPollUpdate={fetchPolls}
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
          </>
        )}
      </PageContainer>
    </AppLayout>
  );
}
