import { Calendar, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  location?: string | null;
  group_id: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  loading: boolean;
  getGroupName: (groupId: string) => string;
}

export function UpcomingAppointments({ appointments, loading, getGroupName }: UpcomingAppointmentsProps) {
  const navigate = useNavigate();

  const getDayBadge = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return <Badge variant="default" className="text-xs">Heute</Badge>;
    if (isTomorrow(date)) return <Badge variant="secondary" className="text-xs">Morgen</Badge>;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Kommende Termine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Kommende Termine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Keine Termine"
            description="Du hast keine anstehenden Termine"
          />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => navigate(`/groups/${appointment.group_id}`)}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{appointment.title}</p>
                    <p className="text-xs text-muted-foreground">{getGroupName(appointment.group_id)}</p>
                  </div>
                  {getDayBadge(appointment.start_time)}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(appointment.start_time), "dd. MMM, HH:mm", { locale: de })}
                  </span>
                  {appointment.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{appointment.location}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
