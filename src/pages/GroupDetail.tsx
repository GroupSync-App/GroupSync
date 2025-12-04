import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Copy, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Placeholder data for UI demonstration
const mockGroup = {
  id: "1",
  title: "Webentwicklung Projekt",
  subject: "Informatik",
  description: "Gemeinsames Projekt zur Entwicklung einer React-Webanwendung. Wir bauen eine Task-Management-App mit modernem UI/UX Design.",
  deadline: "15. Januar 2025",
  maxMembers: 5,
  inviteCode: "ABC123",
  members: [
    { id: "1", name: "Max Mustermann", role: "organiser", studyProgram: "Informatik" },
    { id: "2", name: "Anna Schmidt", role: "member", studyProgram: "Medieninformatik" },
    { id: "3", name: "Tim Weber", role: "member", studyProgram: "Informatik" },
  ],
};

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const group = mockGroup; // Will be replaced with real data in Phase 4

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
              {group.title}
            </h1>
            <p className="text-muted-foreground mt-1">{group.subject}</p>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {group.members.length}/{group.maxMembers} Mitglieder
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Deadline: {group.deadline}</span>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </CardContent>
          </Card>

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
                  {group.inviteCode}
                </code>
                <Button variant="outline" size="icon">
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
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.studyProgram}
                      </p>
                    </div>
                    {member.role === "organiser" && (
                      <Badge variant="secondary">Organiser</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
