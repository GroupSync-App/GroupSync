import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sendTaskAssignedEmail, notifyGroupMembers } from "@/lib/email";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export interface Task {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  assigned_to: string | null;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useTasks(groupId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      let query = supabase.from("tasks").select("*");
      
      if (groupId) {
        query = query.eq("group_id", groupId);
      }

      const { data, error: fetchError } = await query.order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setTasks((data || []) as Task[]);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err as Error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data: {
    group_id: string;
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    assigned_to?: string;
    due_date?: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert({
          group_id: data.group_id,
          title: data.title,
          description: data.description || null,
          priority: data.priority || "medium",
          assigned_to: data.assigned_to || null,
          due_date: data.due_date || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Aufgabe erstellt",
        description: `"${data.title}" wurde hinzugefügt.`,
      });

      const creatorName = profile?.display_name || user.email?.split("@")[0] || "Jemand";
      const dueDateFormatted = data.due_date 
        ? format(new Date(data.due_date), "dd. MMMM yyyy", { locale: de })
        : undefined;

      // Notify all group members about the new task
      notifyGroupMembers(
        data.group_id,
        user.id,
        "task-created",
        {
          taskTitle: data.title,
          taskDescription: data.description,
          dueDate: dueDateFormatted,
          priority: data.priority || "medium",
          creatorName,
        }
      ).catch((err) => {
        console.error("Failed to notify group members:", err);
      });

      // If task is assigned to someone specific, send them an additional assignment email
      if (data.assigned_to && data.assigned_to !== user.id) {
        // Get the assigned user's profile
        const { data: assignedProfile } = await supabase
          .from("profiles")
          .select("email, display_name")
          .eq("id", data.assigned_to)
          .single();

        // Get the group name
        const { data: group } = await supabase
          .from("groups")
          .select("name")
          .eq("id", data.group_id)
          .single();

        if (assignedProfile?.email) {
          sendTaskAssignedEmail(
            assignedProfile.email,
            data.title,
            creatorName,
            group?.name || "Gruppe",
            data.description,
            dueDateFormatted,
            assignedProfile.display_name
          ).catch((err) => {
            console.error("Failed to send task assignment email:", err);
          });
        }
      }

      await fetchTasks();
      return { data: newTask, error: null };
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Fehler",
        description: "Aufgabe konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) throw error;

      await fetchTasks();
      return { error: null };
    } catch (error) {
      console.error("Error updating task:", error);
      return { error };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error, data } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "Keine Berechtigung",
          description: "Du kannst diese Aufgabe nicht löschen.",
          variant: "destructive",
        });
        return { error: new Error("No permission to delete") };
      }

      toast({
        title: "Aufgabe gelöscht",
        description: "Die Aufgabe wurde entfernt.",
      });

      await fetchTasks();
      return { error: null };
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Fehler",
        description: "Aufgabe konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, groupId]);

  const openTasksCount = tasks.filter((t) => t.status === "open").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return {
    tasks,
    loading,
    error,
    openTasksCount,
    inProgressCount,
    completedCount,
    createTask,
    updateTaskStatus,
    deleteTask,
    refetch: fetchTasks,
  };
}
