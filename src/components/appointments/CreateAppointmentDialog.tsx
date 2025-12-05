import { useState } from "react";
import { Plus, CalendarPlus } from "lucide-react";
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

interface CreateAppointmentDialogProps {
  onCreateAppointment: (appointment: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time?: string;
  }) => Promise<void>;
}

export function CreateAppointmentDialog({ onCreateAppointment }: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime) return;

    setLoading(true);
    try {
      const start_time = new Date(`${startDate}T${startTime}`).toISOString();
      const end_time = endDate && endTime 
        ? new Date(`${endDate}T${endTime}`).toISOString() 
        : undefined;

      await onCreateAppointment({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start_time,
        end_time,
      });
      setOpen(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarPlus className="h-4 w-4 mr-1" />
          Neuer Termin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Neuen Termin erstellen</DialogTitle>
            <DialogDescription>
              Plane ein Treffen für deine Gruppe.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="flex items-center gap-1">
                Titel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Projektbesprechung"
                required
                className={!title.trim() ? "border-destructive/50 focus:border-destructive" : ""}
              />
              {!title.trim() && (
                <p className="text-xs text-muted-foreground">Bitte gib einen Titel ein</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Worum geht es bei dem Treffen?"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="z.B. Bibliothek, Zoom-Link..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date" className="flex items-center gap-1">
                  Startdatum <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className={!startDate ? "border-destructive/50" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_time" className="flex items-center gap-1">
                  Startzeit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className={!startTime ? "border-destructive/50" : ""}
                />
              </div>
            </div>
            {(!startDate || !startTime) && (
              <p className="text-xs text-muted-foreground -mt-2">Bitte Datum und Uhrzeit ausfüllen</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="end_date">Enddatum</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_time">Endzeit</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !startDate || !startTime}>
              {loading ? "Erstelle..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}