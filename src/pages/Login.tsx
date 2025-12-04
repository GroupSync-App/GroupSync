import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/layout/PageContainer";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <PageContainer size="sm" className="py-0">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">GroupSync</h1>
          <p className="text-muted-foreground mt-1">Gruppenarbeit, einfach organisiert.</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Willkommen zurück</CardTitle>
            <CardDescription>
              Melde dich an, um deine Gruppen zu verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" placeholder="deine@email.de" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full" size="lg">
              Anmelden
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <button className="text-primary hover:underline font-medium">
                Registrieren
              </button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
