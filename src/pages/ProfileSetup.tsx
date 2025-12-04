import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageTitle } from "@/components/layout/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ClipboardList, Loader2 } from "lucide-react";
import { SkillsSelector } from "@/components/profile/SkillsSelector";
import { AvailabilityGrid, AvailabilityData } from "@/components/profile/AvailabilityGrid";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const UNIVERSITIES = [
  "Technische Universität München",
  "Ludwig-Maximilians-Universität München",
  "Universität Hamburg",
  "Freie Universität Berlin",
  "Humboldt-Universität zu Berlin",
  "RWTH Aachen",
  "Universität Heidelberg",
  "Universität zu Köln",
  "Universität Frankfurt",
  "Universität Stuttgart",
  "Andere",
];

const STUDY_PROGRAMS = [
  "Informatik",
  "Wirtschaftsinformatik",
  "BWL",
  "VWL",
  "Maschinenbau",
  "Elektrotechnik",
  "Medizin",
  "Jura",
  "Psychologie",
  "Physik",
  "Mathematik",
  "Biologie",
  "Chemie",
  "Architektur",
  "Design",
  "Kommunikationswissenschaft",
  "Andere",
];

const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [university, setUniversity] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [semester, setSemester] = useState<number | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [preferredGroupSize, setPreferredGroupSize] = useState(4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!university || !studyProgram || !semester) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Fehler",
        description: "Du musst angemeldet sein.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          university,
          study_program: studyProgram,
          semester,
          skills,
          availability,
          preferred_group_size: preferredGroupSize,
          profile_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Profil gespeichert!",
        description: "Dein Profil wurde erfolgreich aktualisiert.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showHeader={false}>
      <PageContainer size="md" className="min-h-screen flex flex-col justify-center py-8">
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

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Studium</CardTitle>
              <CardDescription>
                Informationen zu deinem Studium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="university">Universität *</Label>
                <Select value={university} onValueChange={setUniversity}>
                  <SelectTrigger id="university">
                    <SelectValue placeholder="Wähle deine Universität" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIVERSITIES.map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyProgram">Studiengang *</Label>
                <Select value={studyProgram} onValueChange={setStudyProgram}>
                  <SelectTrigger id="studyProgram">
                    <SelectValue placeholder="Wähle deinen Studiengang" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDY_PROGRAMS.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select 
                  value={semester?.toString() || ""} 
                  onValueChange={(v) => setSemester(parseInt(v))}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Wähle dein Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        {sem}. Semester
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills & Stärken</CardTitle>
              <CardDescription>
                Was kannst du besonders gut?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SkillsSelector value={skills} onChange={setSkills} />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Verfügbarkeit</CardTitle>
              <CardDescription>
                Wann hast du Zeit für Gruppenarbeit?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvailabilityGrid value={availability} onChange={setAvailability} />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Gruppenpräferenz</CardTitle>
              <CardDescription>
                Wie groß sollte deine ideale Lerngruppe sein?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">2 Personen</span>
                <span className="text-lg font-semibold text-primary">{preferredGroupSize} Personen</span>
                <span className="text-sm text-muted-foreground">8 Personen</span>
              </div>
              <Slider
                value={[preferredGroupSize]}
                onValueChange={(v) => setPreferredGroupSize(v[0])}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              "Profil speichern & weiter"
            )}
          </Button>
        </form>
      </PageContainer>
    </AppLayout>
  );
}
