import { useState } from "react";
import { Plus, X, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const pollSchema = z.object({
  title: z.string().trim().min(1, "Frage ist erforderlich").max(200, "Frage darf max. 200 Zeichen haben"),
  description: z.string().max(1000, "Beschreibung darf max. 1000 Zeichen haben").optional(),
  options: z.array(z.string().max(200, "Option darf max. 200 Zeichen haben")),
});

interface CreatePollDialogProps {
  onCreatePoll: (data: {
    title: string;
    description?: string;
    options: string[];
    allow_multiple_votes?: boolean;
    is_anonymous?: boolean;
    ends_at?: string | null;
  }) => Promise<void>;
}

export function CreatePollDialog({ onCreatePoll }: CreatePollDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [endsAt, setEndsAt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validOptions = options.filter((o) => o.trim() !== "");
    if (validOptions.length < 2) {
      setErrors({ options: "Mindestens 2 Optionen erforderlich" });
      return;
    }

    const result = pollSchema.safeParse({ title, description, options: validOptions });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    await onCreatePoll({
      title,
      description: description || undefined,
      options: validOptions,
      allow_multiple_votes: allowMultiple,
      is_anonymous: isAnonymous,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    });
    setLoading(false);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setOptions(["", ""]);
    setAllowMultiple(false);
    setIsAnonymous(false);
    setEndsAt("");
    setErrors({});
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value.slice(0, 200);
    setOptions(newOptions);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Vote className="h-4 w-4 mr-2" />
          Neue Umfrage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Neue Umfrage erstellen</DialogTitle>
            <DialogDescription>
              Erstelle eine Abstimmung für deine Gruppe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Frage *</Label>
              <Input
                id="title"
                placeholder="Wann sollen wir uns treffen?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Optionale Details zur Umfrage..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={2}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="space-y-2">
              <Label>Optionen * (mind. 2)</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      maxLength={200}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.options && <p className="text-xs text-destructive">{errors.options}</p>}
              {options.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Option hinzufügen
                </Button>
              )}
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mehrfachauswahl</Label>
                  <p className="text-xs text-muted-foreground">
                    Mehrere Optionen wählbar
                  </p>
                </div>
                <Switch
                  checked={allowMultiple}
                  onCheckedChange={setAllowMultiple}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Anonyme Abstimmung</Label>
                  <p className="text-xs text-muted-foreground">
                    Stimmen werden nicht angezeigt
                  </p>
                </div>
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">Endet am (optional)</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !title.trim() ||
                options.filter((o) => o.trim()).length < 2
              }
            >
              {loading ? "Erstellen..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}