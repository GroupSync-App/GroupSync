import { useParams } from "react-router-dom";
import { Users, Calendar, UserPlus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Placeholder data for UI demonstration
const mockGroup = {
  id: "1",
  title: "Webentwicklung Projekt",
  subject: "Informatik",
  description: "Gemeinsames Projekt zur Entwicklung einer React-Webanwendung.",
  deadline: "15. Januar 2025",
  memberCount: 3,
  maxMembers: 5,
};

export default function JoinGroup() {
  const { code } = useParams();
  const group = mockGroup; // Will be replaced with real data in Phase 5
  const spotsLeft = group.maxMembers - group.memberCount;

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
            <CardTitle>{group.title}</CardTitle>
            <CardDescription>{group.subject}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{group.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {group.memberCount}/{group.maxMembers} Mitglieder
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{group.deadline}</span>
              </div>
            </div>

            {spotsLeft > 0 ? (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Noch {spotsLeft} {spotsLeft === 1 ? "Platz" : "Plätze"} frei
                </p>
                <Button className="w-full" size="lg">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Gruppe beitreten
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
