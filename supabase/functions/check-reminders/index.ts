import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    console.log(`[check-reminders] Running at ${now.toISOString()}`);
    console.log(`[check-reminders] Looking for items due before ${in24Hours.toISOString()}`);

    const results = {
      appointmentReminders: 0,
      taskReminders: 0,
      pollReminders: 0,
      errors: [] as string[],
    };

    // 1. Check for appointments in the next 24 hours
    const { data: upcomingAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        title,
        start_time,
        location,
        group_id
      `)
      .gte("start_time", now.toISOString())
      .lte("start_time", in24Hours.toISOString());

    if (appointmentsError) {
      console.error("[check-reminders] Error fetching appointments:", appointmentsError);
      results.errors.push(`Appointments: ${appointmentsError.message}`);
    } else if (upcomingAppointments && upcomingAppointments.length > 0) {
      console.log(`[check-reminders] Found ${upcomingAppointments.length} upcoming appointments`);
      
      for (const appointment of upcomingAppointments) {
        // Get all group members for this appointment
        const { data: members, error: membersError } = await supabase
          .from("group_members")
          .select(`
            user_id,
            profiles:user_id (
              email,
              display_name
            )
          `)
          .eq("group_id", appointment.group_id);

        if (membersError) {
          console.error(`[check-reminders] Error fetching members for appointment ${appointment.id}:`, membersError);
          continue;
        }

        for (const member of members || []) {
          const profile = member.profiles as any;
          if (!profile?.email) continue;

          // Check if reminder was already sent
          const { data: existingReminder } = await supabase
            .from("email_reminders_sent")
            .select("id")
            .eq("reminder_type", "appointment")
            .eq("reference_id", appointment.id)
            .eq("user_id", member.user_id)
            .single();

          if (existingReminder) {
            console.log(`[check-reminders] Reminder already sent for appointment ${appointment.id} to user ${member.user_id}`);
            continue;
          }

          // Send reminder email
          const appointmentDate = new Date(appointment.start_time);
          const { error: emailError } = await supabase.functions.invoke("send-email", {
            body: {
              type: "appointment-reminder",
              to: profile.email,
              recipientName: profile.display_name,
              appointmentTitle: appointment.title,
              appointmentDate: appointmentDate.toLocaleDateString("de-DE"),
              appointmentTime: appointmentDate.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
              appointmentLocation: appointment.location,
            },
          });

          if (emailError) {
            console.error(`[check-reminders] Error sending appointment reminder:`, emailError);
            results.errors.push(`Appointment email to ${profile.email}: ${emailError.message}`);
          } else {
            // Record that reminder was sent
            await supabase.from("email_reminders_sent").insert({
              reminder_type: "appointment",
              reference_id: appointment.id,
              user_id: member.user_id,
            });
            results.appointmentReminders++;
            console.log(`[check-reminders] Sent appointment reminder to ${profile.email}`);
          }
        }
      }
    }

    // 2. Check for tasks due in the next 24 hours
    const todayStr = now.toISOString().split("T")[0];
    const tomorrowStr = in24Hours.toISOString().split("T")[0];
    
    const { data: dueTasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        due_date,
        assigned_to,
        created_by,
        profiles:assigned_to (
          email,
          display_name
        ),
        creator:created_by (
          display_name
        )
      `)
      .in("due_date", [todayStr, tomorrowStr])
      .neq("status", "done");

    if (tasksError) {
      console.error("[check-reminders] Error fetching tasks:", tasksError);
      results.errors.push(`Tasks: ${tasksError.message}`);
    } else if (dueTasks && dueTasks.length > 0) {
      console.log(`[check-reminders] Found ${dueTasks.length} due tasks`);
      
      for (const task of dueTasks) {
        if (!task.assigned_to) continue;
        
        const profile = task.profiles as any;
        const creator = task.creator as any;
        if (!profile?.email) continue;

        // Check if reminder was already sent
        const { data: existingReminder } = await supabase
          .from("email_reminders_sent")
          .select("id")
          .eq("reminder_type", "task")
          .eq("reference_id", task.id)
          .eq("user_id", task.assigned_to)
          .single();

        if (existingReminder) {
          console.log(`[check-reminders] Reminder already sent for task ${task.id}`);
          continue;
        }

        // Send reminder email
        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            type: "task-due-reminder",
            to: profile.email,
            recipientName: profile.display_name,
            taskTitle: task.title,
            taskDescription: task.description,
            dueDate: task.due_date,
            assignerName: creator?.display_name || "Ein Gruppenmitglied",
          },
        });

        if (emailError) {
          console.error(`[check-reminders] Error sending task reminder:`, emailError);
          results.errors.push(`Task email to ${profile.email}: ${emailError.message}`);
        } else {
          await supabase.from("email_reminders_sent").insert({
            reminder_type: "task",
            reference_id: task.id,
            user_id: task.assigned_to,
          });
          results.taskReminders++;
          console.log(`[check-reminders] Sent task reminder to ${profile.email}`);
        }
      }
    }

    // 3. Check for polls ending in the next 24 hours
    const { data: endingPolls, error: pollsError } = await supabase
      .from("polls")
      .select(`
        id,
        title,
        ends_at,
        group_id
      `)
      .gte("ends_at", now.toISOString())
      .lte("ends_at", in24Hours.toISOString());

    if (pollsError) {
      console.error("[check-reminders] Error fetching polls:", pollsError);
      results.errors.push(`Polls: ${pollsError.message}`);
    } else if (endingPolls && endingPolls.length > 0) {
      console.log(`[check-reminders] Found ${endingPolls.length} ending polls`);
      
      for (const poll of endingPolls) {
        // Get group members who haven't voted
        const { data: members } = await supabase
          .from("group_members")
          .select(`
            user_id,
            profiles:user_id (
              email,
              display_name
            )
          `)
          .eq("group_id", poll.group_id);

        // Get users who already voted
        const { data: votes } = await supabase
          .from("poll_votes")
          .select("user_id")
          .eq("poll_id", poll.id);

        const votedUserIds = new Set((votes || []).map(v => v.user_id));

        for (const member of members || []) {
          if (votedUserIds.has(member.user_id)) continue;
          
          const profile = member.profiles as any;
          if (!profile?.email) continue;

          // Check if reminder was already sent
          const { data: existingReminder } = await supabase
            .from("email_reminders_sent")
            .select("id")
            .eq("reminder_type", "poll")
            .eq("reference_id", poll.id)
            .eq("user_id", member.user_id)
            .single();

          if (existingReminder) continue;

          // Send reminder email
          const endsAt = new Date(poll.ends_at!);
          const { error: emailError } = await supabase.functions.invoke("send-email", {
            body: {
              type: "poll-reminder",
              to: profile.email,
              recipientName: profile.display_name,
              pollTitle: poll.title,
              endsAt: `${endsAt.toLocaleDateString("de-DE")} um ${endsAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`,
            },
          });

          if (emailError) {
            console.error(`[check-reminders] Error sending poll reminder:`, emailError);
            results.errors.push(`Poll email to ${profile.email}: ${emailError.message}`);
          } else {
            await supabase.from("email_reminders_sent").insert({
              reminder_type: "poll",
              reference_id: poll.id,
              user_id: member.user_id,
            });
            results.pollReminders++;
            console.log(`[check-reminders] Sent poll reminder to ${profile.email}`);
          }
        }
      }
    }

    console.log(`[check-reminders] Completed. Sent ${results.appointmentReminders} appointment, ${results.taskReminders} task, ${results.pollReminders} poll reminders`);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[check-reminders] Fatal error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
