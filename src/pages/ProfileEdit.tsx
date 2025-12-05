import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillsSelector } from "@/components/profile/SkillsSelector";
import { AvailabilityGrid, AvailabilityData } from "@/components/profile/AvailabilityGrid";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { profileEditSchema } from "@/lib/validationSchemas";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    display_name: "",
    university: "",
    faculty: "",
    study_program: "",
    semester: "",
    bio: "",
    skills: [] as string[],
    availability: {} as AvailabilityData,
    preferred_group_size: "4",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        university: profile.university || "",
        faculty: profile.faculty || "",
        study_program: profile.study_program || "",
        semester: profile.semester?.toString() || "",
        bio: profile.bio || "",
        skills: profile.skills || [],
        availability: (profile.availability as AvailabilityData) || {},
        preferred_group_size: profile.preferred_group_size?.toString() || "4",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});

    const validation = profileEditSchema.safeParse({
      display_name: formData.display_name || undefined,
      university: formData.university || undefined,
      faculty: formData.faculty || undefined,
      study_program: formData.study_program || undefined,
      semester: formData.semester ? parseInt(formData.semester) : null,
      bio: formData.bio || undefined,
      skills: formData.skills,
      availability: formData.availability,
      preferred_group_size: parseInt(formData.preferred_group_size),
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: formData.display_name,
        university: formData.university,
        faculty: formData.faculty,
        study_program: formData.study_program,
        semester: formData.semester ? parseInt(formData.semester) : null,
        bio: formData.bio,
        skills: formData.skills,
        availability: formData.availability,
        preferred_group_size: parseInt(formData.preferred_group_size),
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast.error("Fehler beim Speichern des Profils");
    } else {
      toast.success("Profil erfolgreich aktualisiert");
      await refreshProfile();
      navigate("/dashboard");
    }
  };

  return (
    <AppLayout>
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Button>

          <PageTitle subtitle="Aktualisiere deine Informationen und Präferenzen">
            Profil bearbeiten
          </PageTitle>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display_name">Anzeigename</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  placeholder="Max Mustermann"
                  maxLength={100}
                />
                {errors.display_name && <p className="text-xs text-destructive">{errors.display_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">Universität</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value })
                  }
                  placeholder="TU München"
                  maxLength={200}
                />
                {errors.university && <p className="text-xs text-destructive">{errors.university}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Fakultät</Label>
                <Input
                  id="faculty"
                  value={formData.faculty}
                  onChange={(e) =>
                    setFormData({ ...formData, faculty: e.target.value })
                  }
                  placeholder="Informatik"
                  maxLength={200}
                />
                {errors.faculty && <p className="text-xs text-destructive">{errors.faculty}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="study_program">Studiengang</Label>
                <Input
                  id="study_program"
                  value={formData.study_program}
                  onChange={(e) =>
                    setFormData({ ...formData, study_program: e.target.value })
                  }
                  placeholder="Bachelor Informatik"
                  maxLength={200}
                />
                {errors.study_program && <p className="text-xs text-destructive">{errors.study_program}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semester wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        {sem}. Semester
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_group_size">
                  Bevorzugte Gruppengröße
                </Label>
                <Select
                  value={formData.preferred_group_size}
                  onValueChange={(value) =>
                    setFormData({ ...formData, preferred_group_size: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Größe wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} Personen
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Über mich</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Erzähle etwas über dich und deine Interessen..."
                rows={4}
                maxLength={1000}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <SkillsSelector
                value={formData.skills}
                onChange={(skills) =>
                  setFormData({ ...formData, skills })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Verfügbarkeit</Label>
              <AvailabilityGrid
                value={formData.availability}
                onChange={(availability) =>
                  setFormData({ ...formData, availability })
                }
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Wird gespeichert..." : "Änderungen speichern"}
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default ProfileEdit;
