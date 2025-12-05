import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Copy, Users, Loader2, LogOut, Trash2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useGroups, GroupWithMembers } from "@/hooks/useGroups";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGroupById, leaveGroup, deleteGroup } = useGroups();
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(id);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return;
      const data = await getGroupById(id);
      setGroup(data);
      setLoading(false);
    };
    fetchGroup();
  }, [id]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const copyInviteCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.invite_code);
    toast({
      title: "Kopiert!",
      description: "Einladungscode in die Zwischenablage kopiert.",
    });
  };

  const handleLeave = async () => {
    if (!id) return;
    const { error } = await leaveGroup(id);
    if (!error) {
      navigate("/dashboard");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await deleteGroup(id);
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
        <PageContainer size="md" className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </PageContainer>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <PageContainer size="md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Gruppe nicht gefunden</CardTitle>
              <CardDescription>
                Diese Gruppe existiert nicht oder du hast keinen Zugriff.
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

  const isOwner = group.members.some(
    (m) => m.user_id === user?.id && m.role === "owner"
  );

  return (
    <AppLayout>
      <PageContainer size="md">
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {group.name}
            </h1>
            {group.subject && (
              <p className="text-muted-foreground mt-1">{group.subject}</p>
            )}
          </div>

          {/* Meta Info */}
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
                <span>Deadline: {formatDeadline(group.deadline)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {group.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Beschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Tasks */}
          <TaskList tasks={tasks} loading={tasksLoading} error={tasksError} />

          {/* Invite Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Einladungscode</CardTitle>
              <CardDescription>
                Teile diesen Code, um neue Mitglieder einzuladen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                  {group.invite_code}
                </code>
                <Button variant="outline" size="icon" onClick={copyInviteCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mitglieder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.members.map((member, index) => (
                <div key={member.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(member.profile?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {member.profile?.display_name || "Unbekannt"}
                      </p>
                      {member.profile?.study_program && (
                        <p className="text-sm text-muted-foreground truncate">
                          {member.profile.study_program}
                        </p>
                      )}
                    </div>
                    {member.role === "owner" && (
                      <Badge variant="secondary">Ersteller</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Leave/Delete Group */}
          {!isOwner ? (
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleLeave}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Gruppe verlassen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Gruppe löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Gruppe löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Diese Aktion kann nicht rückgängig gemacht werden. Die Gruppe 
                        "{group.name}" und alle Mitgliedschaften werden dauerhaft gelöscht.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
