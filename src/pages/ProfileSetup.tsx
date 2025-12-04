import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageTitle } from "@/components/layout/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

export default function ProfileSetup() {
  return (
    <AppLayout showHeader={false}>
      <PageContainer size="md" className="min-h-screen flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-primary" />
          </div>
          <PageTitle className="justify-center text-center">
            Vervollständige dein Profil
          </PageTitle>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ein paar Fragen helfen uns, dich besser mit Gruppenmitgliedern zu verbinden.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profil-Fragebogen</CardTitle>
            <CardDescription>
              Dieser Fragebogen wird in Phase 3 implementiert.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-muted-foreground text-sm">
              <p>Hier werden Multiple-Choice-Fragen zu folgenden Themen erscheinen:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Institution (Schule/Uni)</li>
                <li>Studiengang oder Klasse</li>
                <li>Semester oder Jahrgang</li>
                <li>Lern- und Arbeitstyp</li>
                <li>Kommunikationspräferenz</li>
                <li>Stärken</li>
                <li>Bevorzugte Gruppenrolle</li>
              </ul>
            </div>
            <Button className="w-full mt-6" disabled>
              Profil speichern (Phase 3)
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    </AppLayout>
  );
}
