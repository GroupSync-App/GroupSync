import { supabase } from "@/integrations/supabase/client";

interface WelcomeEmailData {
  type: "welcome";
  to: string;
  recipientName?: string;
}

interface GroupInviteEmailData {
  type: "group-invite";
  to: string;
  recipientName?: string;
  groupName: string;
  inviterName: string;
  inviteCode: string;
}

interface TaskNotificationEmailData {
  type: "task-notification";
  to: string;
  recipientName?: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  assignerName: string;
}

interface AppointmentReminderEmailData {
  type: "appointment-reminder";
  to: string;
  recipientName?: string;
  appointmentTitle: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentLocation?: string;
}

type EmailData = 
  | WelcomeEmailData 
  | GroupInviteEmailData 
  | TaskNotificationEmailData 
  | AppointmentReminderEmailData;

export const sendEmail = async (data: EmailData): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: response, error } = await supabase.functions.invoke("send-email", {
      body: data,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Exception sending email:", err);
    return { success: false, error: err.message };
  }
};

export const sendWelcomeEmail = (to: string, recipientName?: string) =>
  sendEmail({ type: "welcome", to, recipientName });

export const sendGroupInviteEmail = (
  to: string,
  groupName: string,
  inviterName: string,
  inviteCode: string,
  recipientName?: string
) =>
  sendEmail({
    type: "group-invite",
    to,
    recipientName,
    groupName,
    inviterName,
    inviteCode,
  });

export const sendTaskNotificationEmail = (
  to: string,
  taskTitle: string,
  assignerName: string,
  taskDescription?: string,
  dueDate?: string,
  recipientName?: string
) =>
  sendEmail({
    type: "task-notification",
    to,
    recipientName,
    taskTitle,
    taskDescription,
    dueDate,
    assignerName,
  });

export const sendAppointmentReminderEmail = (
  to: string,
  appointmentTitle: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentLocation?: string,
  recipientName?: string
) =>
  sendEmail({
    type: "appointment-reminder",
    to,
    recipientName,
    appointmentTitle,
    appointmentDate,
    appointmentTime,
    appointmentLocation,
  });
