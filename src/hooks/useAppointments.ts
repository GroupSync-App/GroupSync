import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { notifyGroupMembers } from "@/lib/email";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export interface Appointment {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useAppointments(groupId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!user) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      let query = supabase.from("appointments").select("*");

      if (groupId) {
        query = query.eq("group_id", groupId);
      }

      const { data, error: fetchError } = await query.order("start_time", { ascending: true });

      if (fetchError) throw fetchError;

      setAppointments((data || []) as Appointment[]);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err as Error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (data: {
    group_id: string;
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time?: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data: newAppointment, error } = await supabase
        .from("appointments")
        .insert({
          group_id: data.group_id,
          title: data.title,
          description: data.description || null,
          location: data.location || null,
          start_time: data.start_time,
          end_time: data.end_time || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Termin erstellt",
        description: `"${data.title}" wurde hinzugefügt.`,
      });

      // Notify group members about the new appointment
      const creatorName = profile?.display_name || user.email?.split("@")[0] || "Jemand";
      const startDate = new Date(data.start_time);
      const appointmentDate = format(startDate, "dd. MMMM yyyy", { locale: de });
      const appointmentTime = format(startDate, "HH:mm", { locale: de }) + " Uhr";

      notifyGroupMembers(data.group_id, user.id, "appointment-created", {
        appointmentTitle: data.title,
        appointmentDescription: data.description,
        appointmentDate,
        appointmentTime,
        appointmentLocation: data.location,
        creatorName,
      }).catch((err) => {
        console.error("Failed to notify group members:", err);
      });

      await fetchAppointments();
      return { data: newAppointment, error: null };
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateAppointment = async (
    appointmentId: string,
    data: Partial<Omit<Appointment, "id" | "group_id" | "created_by" | "created_at" | "updated_at">>
  ) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update(data)
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Termin aktualisiert",
        description: "Die Änderungen wurden gespeichert.",
      });

      await fetchAppointments();
      return { error: null };
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Termin gelöscht",
        description: "Der Termin wurde entfernt.",
      });

      await fetchAppointments();
      return { error: null };
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, groupId]);

  // Get upcoming appointments
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.start_time) >= new Date()
  );

  const pastAppointments = appointments.filter(
    (a) => new Date(a.start_time) < new Date()
  );

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  };
}
