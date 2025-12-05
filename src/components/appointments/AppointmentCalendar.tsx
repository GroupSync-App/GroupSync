import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Appointment } from "@/hooks/useAppointments";
import { CreateAppointmentDialog } from "./CreateAppointmentDialog";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { de } from "date-fns/locale";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onCreateAppointment?: (appointment: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time?: string;
  }) => Promise<void>;
  onDeleteAppointment?: (appointmentId: string) => Promise<{ error: unknown }>;
}

export function AppointmentCalendar({
  appointments,
  onCreateAppointment,
  onDeleteAppointment,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.start_time), date)
    );
  };

  // Get days with appointments in current month view
  const daysWithAppointments = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    return days.filter((day) => 
      appointments.some((apt) => isSameDay(new Date(apt.start_time), day))
    );
  }, [appointments, currentMonth]);

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    return getAppointmentsForDay(selectedDate).sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [appointments, selectedDate]);

  // Custom day render to show dots for appointments
  const modifiers = {
    hasAppointment: daysWithAppointments,
  };

  const modifiersStyles = {
    hasAppointment: {
      position: "relative" as const,
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Termine vorhanden</span>
        </div>
        {onCreateAppointment && (
          <CreateAppointmentDialog onCreateAppointment={onCreateAppointment} />
        )}
      </div>
      
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Calendar */}
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={de}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border p-3 pointer-events-auto"
            components={{
              DayContent: ({ date }) => {
                const hasAppointments = daysWithAppointments.some((d) =>
                  isSameDay(d, date)
                );
                const appointmentCount = getAppointmentsForDay(date).length;
                
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span>{date.getDate()}</span>
                    {hasAppointments && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {appointmentCount <= 3 ? (
                          Array.from({ length: appointmentCount }).map((_, i) => (
                            <span
                              key={i}
                              className="w-1 h-1 rounded-full bg-primary"
                            />
                          ))
                        ) : (
                          <>
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            <span className="text-[8px] text-primary font-medium">+</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                );
              },
            }}
          />
        </div>

        {/* Selected day appointments */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">
              {isToday(selectedDate)
                ? "Heute"
                : format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {selectedDateAppointments.length} Termin{selectedDateAppointments.length !== 1 ? "e" : ""}
            </Badge>
          </div>

          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keine Termine an diesem Tag</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px] lg:h-[250px]">
              <div className="space-y-2 pr-2">
                {selectedDateAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {appointment.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(appointment.start_time), "HH:mm", { locale: de })}
                            {appointment.end_time &&
                              ` - ${format(new Date(appointment.end_time), "HH:mm", { locale: de })}`}
                            {" Uhr"}
                          </span>
                        </div>
                        {appointment.location && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{appointment.location}</span>
                          </div>
                        )}
                      </div>
                      {onDeleteAppointment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() => onDeleteAppointment(appointment.id)}
                        >
                          Löschen
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}