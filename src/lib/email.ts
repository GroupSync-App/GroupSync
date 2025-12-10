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

interface TaskDueReminderEmailData {
  type: "task-due-reminder";
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

interface PollReminderEmailData {
  type: "poll-reminder";
  to: string;
  recipientName?: string;
  pollTitle: string;
  endsAt: string;
}

interface PollCreatedEmailData {
  type: "poll-created";
  to: string;
  recipientName?: string;
  pollTitle: string;
  pollDescription?: string;
  creatorName: string;
  groupName: string;
  endsAt?: string;
}

interface AppointmentCreatedEmailData {
  type: "appointment-created";
  to: string;
  recipientName?: string;
  appointmentTitle: string;
  appointmentDescription?: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentLocation?: string;
  creatorName: string;
  groupName: string;
}

interface TaskAssignedEmailData {
  type: "task-assigned";
  to: string;
  recipientName?: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  assignerName: string;
  groupName: string;
}

type EmailData = 
  | WelcomeEmailData 
  | GroupInviteEmailData 
  | TaskNotificationEmailData 
  | TaskDueReminderEmailData
  | AppointmentReminderEmailData
  | PollReminderEmailData
  | PollCreatedEmailData
  | AppointmentCreatedEmailData
  | TaskAssignedEmailData;

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

export const sendTaskDueReminderEmail = (
  to: string,
  taskTitle: string,
  assignerName: string,
  taskDescription?: string,
  dueDate?: string,
  recipientName?: string
) =>
  sendEmail({
    type: "task-due-reminder",
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

export const sendPollReminderEmail = (
  to: string,
  pollTitle: string,
  endsAt: string,
  recipientName?: string
) =>
  sendEmail({
    type: "poll-reminder",
    to,
    recipientName,
    pollTitle,
    endsAt,
  });

// New email functions for immediate notifications

export const sendPollCreatedEmail = (
  to: string,
  pollTitle: string,
  creatorName: string,
  groupName: string,
  pollDescription?: string,
  endsAt?: string,
  recipientName?: string
) =>
  sendEmail({
    type: "poll-created",
    to,
    recipientName,
    pollTitle,
    pollDescription,
    creatorName,
    groupName,
    endsAt,
  });

export const sendAppointmentCreatedEmail = (
  to: string,
  appointmentTitle: string,
  appointmentDate: string,
  appointmentTime: string,
  creatorName: string,
  groupName: string,
  appointmentDescription?: string,
  appointmentLocation?: string,
  recipientName?: string
) =>
  sendEmail({
    type: "appointment-created",
    to,
    recipientName,
    appointmentTitle,
    appointmentDescription,
    appointmentDate,
    appointmentTime,
    appointmentLocation,
    creatorName,
    groupName,
  });

export const sendTaskAssignedEmail = (
  to: string,
  taskTitle: string,
  assignerName: string,
  groupName: string,
  taskDescription?: string,
  dueDate?: string,
  recipientName?: string
) =>
  sendEmail({
    type: "task-assigned",
    to,
    recipientName,
    taskTitle,
    taskDescription,
    dueDate,
    assignerName,
    groupName,
  });

// Helper function to notify all group members
export const notifyGroupMembers = async (
  groupId: string,
  excludeUserId: string,
  emailType: "poll-created" | "appointment-created" | "task-created",
  emailData: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke("notify-group-members", {
      body: {
        groupId,
        excludeUserId,
        emailType,
        emailData,
      },
    });

    if (error) {
      console.error("Error notifying group members:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Exception notifying group members:", err);
    return { success: false, error: err.message };
  }
};
