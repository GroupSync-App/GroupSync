import { useState } from "react";
import { Calendar, Clock, MapPin, AlertCircle, Trash2, MoreVertical, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment } from "@/hooks/useAppointments";
import { CreateAppointmentDialog } from "./CreateAppointmentDialog";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { de } from "date-fns/locale";

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  error: Error | null;
  onCreateAppointment?: (appointment: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time?: string;
  }) => Promise<void>;
  onDeleteAppointment?: (appointmentId: string) => Promise<{ error: unknown }>;
}

type TimeFilter = "all" | "upcoming" | "past";

export function AppointmentList({
  appointments,
  loading,
  error,
  onCreateAppointment,
  onDeleteAppointment,
}: AppointmentListProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    
    let dayLabel = format(date, "EEEE, d. MMMM", { locale: de });
    if (isToday(date)) {
      dayLabel = "Heute";
    } else if (isTomorrow(date)) {
      dayLabel = "Morgen";
    }
    
    const time = format(date, "HH:mm", { locale: de });
    return { dayLabel, time, date };
  };

  const getTimeBadge = (startTime: string) => {
    const date = new Date(startTime);
    if (isPast(date)) {
      return <Badge variant="secondary" className="text-xs">Vergangen</Badge>;
    }
    if (isToday(date)) {
      return <Badge variant="default" className="text-xs bg-emerald-500">Heute</Badge>;
    }
    if (isTomorrow(date)) {
      return <Badge variant="outline" className="text-xs">Morgen</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Termine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Termine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Termine konnten nicht geladen werden.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const upcomingAppointments = appointments.filter((a) => new Date(a.start_time) >= now);
  const pastAppointments = appointments.filter((a) => new Date(a.start_time) < now);

  const filteredAppointments = 
    timeFilter === "upcoming" ? upcomingAppointments :
    timeFilter === "past" ? pastAppointments :
    appointments;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Termine
          </CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{upcomingAppointments.length} kommend</span>
              <span>•</span>
              <span>{pastAppointments.length} vergangen</span>
            </div>
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Kommende</SelectItem>
                <SelectItem value="past">Vergangene</SelectItem>
                <SelectItem value="all">Alle</SelectItem>
              </SelectContent>
            </Select>
            {onCreateAppointment && (
              <CreateAppointmentDialog onCreateAppointment={onCreateAppointment} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Termine geplant.
          </p>
        ) : filteredAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine {timeFilter === "upcoming" ? "kommenden" : "vergangenen"} Termine.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => {
              const { dayLabel, time } = formatDateTime(appointment.start_time);
              const endFormatted = appointment.end_time 
                ? format(new Date(appointment.end_time), "HH:mm", { locale: de })
                : null;
              const isAppointmentPast = isPast(new Date(appointment.start_time));

              return (
                <div
                  key={appointment.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${
                    isAppointmentPast ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded bg-primary/10 text-primary">
                    <span className="text-lg font-bold">
                      {format(new Date(appointment.start_time), "d")}
                    </span>
                    <span className="text-xs uppercase">
                      {format(new Date(appointment.start_time), "MMM", { locale: de })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium text-sm ${isAppointmentPast ? "text-muted-foreground" : "text-foreground"}`}>
                        {appointment.title}
                      </p>
                      {getTimeBadge(appointment.start_time)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {time}{endFormatted ? ` - ${endFormatted}` : ""} Uhr
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dayLabel}
                      </span>
                    </div>
                    {appointment.location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appointment.location}
                      </p>
                    )}
                    {appointment.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {appointment.description}
                      </p>
                    )}
                  </div>
                  {onDeleteAppointment && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDeleteAppointment(appointment.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}