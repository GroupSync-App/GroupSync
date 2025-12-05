import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Calendar, UserPlus, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGroups } from "@/hooks/useGroups";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Type for the group preview data returned by the secure RPC function
interface GroupPreview {
  id: string;
  name: string;
  subject: string | null;
  description: string | null;
  max_members: number;
  deadline: string | null;
  memberCount: number;
}

export default function JoinGroup() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { getGroupByInviteCode, joinGroup } = useGroups();
  const [group, setGroup] = useState<GroupPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!code) return;
      const data = await getGroupByInviteCode(code);
      setGroup(data);
      setLoading(false);
    };
    fetchGroup();
  }, [code]);

  const handleJoin = async () => {
    if (!code) return;
    setJoining(true);
    const { error } = await joinGroup(code);
    setJoining(false);
    if (!error) {
      navigate("/dashboard");
    }
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    try {
      return format(new Date(deadline), "d. MMMM yyyy", { locale: de });
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageContainer size="sm" className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </PageContainer>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <PageContainer size="sm" className="min-h-[calc(100vh-4rem)] flex flex-col justify-center">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Gruppe nicht gefunden</CardTitle>
              <CardDescription>
                Der Einladungscode "{code}" ist ungültig oder abgelaufen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/dashboard")}>
                Zum Dashboard
              </Button>
            </CardContent>
          </Card>
        </PageContainer>
      </AppLayout>
    );
  }

  const spotsLeft = group.max_members - group.memberCount;

  return (
    <AppLayout>
      <PageContainer size="sm" className="min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        <div className="text-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Gruppe beitreten</h1>
          <p className="text-muted-foreground mt-1">
            Einladungscode: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{code}</code>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
            {group.subject && <CardDescription>{group.subject}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            {group.description && (
              <p className="text-sm text-muted-foreground">{group.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {group.memberCount}/{group.max_members} Mitglieder
                </span>
              </div>
              {group.deadline && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDeadline(group.deadline)}</span>
                </div>
              )}
            </div>

            {spotsLeft > 0 ? (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Noch {spotsLeft} {spotsLeft === 1 ? "Platz" : "Plätze"} frei
                </p>
                <Button className="w-full" size="lg" onClick={handleJoin} disabled={joining}>
                  {joining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Beitreten...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Gruppe beitreten
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="pt-2">
                <p className="text-sm text-destructive">
                  Diese Gruppe ist leider voll.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </AppLayout>
  );
}
