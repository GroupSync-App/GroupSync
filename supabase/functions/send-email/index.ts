import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "welcome" | "group-invite" | "task-notification" | "appointment-reminder" | "task-due-reminder" | "poll-reminder";
  to: string;
  recipientName?: string;
  // For group invite
  groupName?: string;
  inviterName?: string;
  inviteCode?: string;
  // For task notification
  taskTitle?: string;
  taskDescription?: string;
  dueDate?: string;
  assignerName?: string;
  // For appointment reminder
  appointmentTitle?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentLocation?: string;
  // For poll reminder
  pollTitle?: string;
  endsAt?: string;
}

function getWelcomeEmail(recipientName: string): { subject: string; html: string } {
  return {
    subject: "Willkommen bei GroupSync! 🎉",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin: 0;">GroupSync</h1>
        </div>
        <h2 style="color: #1f2937;">Hallo ${recipientName}! 👋</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Willkommen bei GroupSync! Wir freuen uns, dass du dabei bist.
        </p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Mit GroupSync kannst du:
        </p>
        <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
          <li>📚 Lerngruppen erstellen und beitreten</li>
          <li>📅 Termine koordinieren</li>
          <li>✅ Aufgaben verteilen und verfolgen</li>
          <li>🗳️ Abstimmungen durchführen</li>
        </ul>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Viel Erfolg bei deinem Studium!
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Dein GroupSync Team
        </p>
      </div>
    `,
  };
}

function getGroupInviteEmail(
  recipientName: string,
  groupName: string,
  inviterName: string,
  inviteCode: string
): { subject: string; html: string } {
  return {
    subject: `${inviterName} hat dich zu "${groupName}" eingeladen`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin: 0;">GroupSync</h1>
        </div>
        <h2 style="color: #1f2937;">Hallo ${recipientName}! 👋</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          <strong>${inviterName}</strong> hat dich eingeladen, der Gruppe <strong>"${groupName}"</strong> beizutreten!
        </p>
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
          <p style="color: white; font-size: 14px; margin: 0 0 10px 0;">Dein Einladungscode:</p>
          <p style="color: white; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 4px;">${inviteCode}</p>
        </div>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Gib diesen Code in GroupSync ein, um der Gruppe beizutreten.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Dein GroupSync Team
        </p>
      </div>
    `,
  };
}

function getTaskNotificationEmail(
  recipientName: string,
  taskTitle: string,
  taskDescription: string,
  dueDate: string,
  assignerName: string
): { subject: string; html: string } {
  return {
    subject: `Neue Aufgabe: ${taskTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin: 0;">GroupSync</h1>
        </div>
        <h2 style="color: #1f2937;">Hallo ${recipientName}! 👋</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          <strong>${assignerName}</strong> hat dir eine neue Aufgabe zugewiesen:
        </p>
        <div style="background: #f3f4f6; border-left: 4px solid #8B5CF6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">📋 ${taskTitle}</h3>
          <p style="color: #4b5563; margin: 0 0 15px 0;">${taskDescription || "Keine Beschreibung"}</p>
          <p style="color: #8B5CF6; font-weight: 600; margin: 0;">
            📅 Fällig: ${dueDate || "Kein Datum festgelegt"}
          </p>
        </div>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Melde dich bei GroupSync an, um die Aufgabe zu bearbeiten.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Dein GroupSync Team
        </p>
      </div>
    `,
  };
}

function getTaskDueReminderEmail(
  recipientName: string,
  taskTitle: string,
  taskDescription: string,
  dueDate: string,
  assignerName: string
): { subject: string; html: string } {
  return {
    subject: `⏰ Aufgabe fällig: ${taskTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin: 0;">GroupSync</h1>
        </div>
        <h2 style="color: #1f2937;">Hallo ${recipientName}! 👋</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Erinnerung: Deine Aufgabe ist bald fällig!
        </p>
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); border-radius: 12px; padding: 25px; margin: 20px 0; color: white;">
          <h3 style="margin: 0 0 15px 0; font-size: 20px;">⏰ ${taskTitle}</h3>
          <p style="margin: 8px 0; font-size: 16px; opacity: 0.9;">
            ${taskDescription || "Keine Beschreibung"}
          </p>
          <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: bold;">
            📅 Fällig am: ${dueDate}
          </p>
        </div>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Aufgabe zugewiesen von: <strong>${assignerName}</strong>
        </p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Melde dich bei GroupSync an, um die Aufgabe abzuschließen.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Dein GroupSync Team
        </p>
      </div>
    `,
  };
}

function getAppointmentReminderEmail(
  recipientName: string,
  appointmentTitle: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentLocation: string
): { subject: string; html: string } {
  return {
    subject: `Erinnerung: ${appointmentTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin: 0;">GroupSync</h1>
        </div>
        <h2 style="color: #1f2937;">Hallo ${recipientName}! 👋</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Erinnerung an deinen bevorstehenden Termin:
        </p>
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); border-radius: 12px; padding: 25px; margin: 20px 0; color: white;">
          <h3 style="margin: 0 0 15px 0; font-size: 20px;">📅 ${appointmentTitle}</h3>
          <p style="margin: 8px 0; font-size: 16px;">
            🗓️ <strong>Datum:</strong> ${appointmentDate}
          </p>
          <p style="margin: 8px 0; font-size: 16px;">
            ⏰ <strong>Uhrzeit:</strong> ${appointmentTime}
          </p>
          ${appointmentLocation ? `
          <p style="margin: 8px 0; font-size: 16px;">
            📍 <strong>Ort:</strong> ${appointmentLocation}
          </p>
          ` : ""}
        </div>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Vergiss nicht, pünktlich zu erscheinen!
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Dein GroupSync Team
        </p>
      </div>
    `,
  };
}

function getPollReminderEmail(
  recipientName: string,
  pollTitle: string,
  endsAt: string
): { subject: string; html: string } {
  return {
    subject: `🗳️ Umfrage endet bald: ${pollTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin: 0;">GroupSync</h1>
        </div>
        <h2 style="color: #1f2937;">Hallo ${recipientName}! 👋</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Eine Umfrage in deiner Gruppe endet bald und du hast noch nicht abgestimmt!
        </p>
        <div style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%); border-radius: 12px; padding: 25px; margin: 20px 0; color: white;">
          <h3 style="margin: 0 0 15px 0; font-size: 20px;">🗳️ ${pollTitle}</h3>
          <p style="margin: 0; font-size: 18px; font-weight: bold;">
            ⏰ Endet: ${endsAt}
          </p>
        </div>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Melde dich bei GroupSync an, um deine Stimme abzugeben, bevor es zu spät ist!
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Dein GroupSync Team
        </p>
      </div>
    `,
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailRequest: EmailRequest = await req.json();
    const { type, to, recipientName = "Studierende/r" } = emailRequest;

    let emailContent: { subject: string; html: string };

    switch (type) {
      case "welcome":
        emailContent = getWelcomeEmail(recipientName);
        break;
      case "group-invite":
        emailContent = getGroupInviteEmail(
          recipientName,
          emailRequest.groupName || "Gruppe",
          emailRequest.inviterName || "Jemand",
          emailRequest.inviteCode || "XXXXXX"
        );
        break;
      case "task-notification":
        emailContent = getTaskNotificationEmail(
          recipientName,
          emailRequest.taskTitle || "Aufgabe",
          emailRequest.taskDescription || "",
          emailRequest.dueDate || "",
          emailRequest.assignerName || "Jemand"
        );
        break;
      case "task-due-reminder":
        emailContent = getTaskDueReminderEmail(
          recipientName,
          emailRequest.taskTitle || "Aufgabe",
          emailRequest.taskDescription || "",
          emailRequest.dueDate || "",
          emailRequest.assignerName || "Jemand"
        );
        break;
      case "appointment-reminder":
        emailContent = getAppointmentReminderEmail(
          recipientName,
          emailRequest.appointmentTitle || "Termin",
          emailRequest.appointmentDate || "",
          emailRequest.appointmentTime || "",
          emailRequest.appointmentLocation || ""
        );
        break;
      case "poll-reminder":
        emailContent = getPollReminderEmail(
          recipientName,
          emailRequest.pollTitle || "Umfrage",
          emailRequest.endsAt || ""
        );
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    console.log(`Sending ${type} email to ${to}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "GroupSync <noreply@groupsync.team>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
