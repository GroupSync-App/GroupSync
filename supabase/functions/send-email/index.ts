import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "welcome" | "group-invite" | "task-notification" | "appointment-reminder" | "task-due-reminder" | "poll-reminder" | "poll-created" | "appointment-created" | "task-assigned" | "task-created";
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
  priority?: string;
  // For appointment reminder
  appointmentTitle?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentLocation?: string;
  // For poll reminder
  pollTitle?: string;
  endsAt?: string;
  // For poll/appointment/task created
  creatorName?: string;
  pollDescription?: string;
  appointmentDescription?: string;
}

// Design System Colors
const colors = {
  primary: "#11A8D4",
  primaryLight: "#20C9A8",
  gradient: "linear-gradient(135deg, #11A8D4 0%, #20C9A8 100%)",
  background: "#f8fafc",
  cardBg: "#ffffff",
  textDark: "#1e293b",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  border: "#e2e8f0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};

// Reusable email wrapper with Helvetica font
function getEmailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: ${colors.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">GroupSync</h1>
          <p style="margin: 8px 0 0 0; color: ${colors.textMuted}; font-size: 14px; font-weight: 300; font-style: italic;">Deine Lerngruppen-Plattform</p>
        </div>
        
        <!-- Card -->
        <div style="background: ${colors.cardBg}; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
          ${content}
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 24px;">
          <p style="color: ${colors.textLight}; font-size: 13px; margin: 0; font-weight: 300;">
            © ${new Date().getFullYear()} GroupSync • Effizient zusammen lernen
          </p>
          <p style="color: ${colors.textLight}; font-size: 12px; margin: 8px 0 0 0; font-weight: 300; font-style: italic;">
            Diese E-Mail wurde automatisch generiert.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getWelcomeEmail(recipientName: string): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      Willkommen bei <span style="font-weight: 600; text-decoration: underline;">GroupSync</span>! Wir freuen uns, dass du dabei bist.
    </p>
    
    <div style="background: ${colors.gradient}; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Mit GroupSync kannst du:</p>
      <ul style="color: white; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px; font-weight: 400;">
        <li>Lerngruppen erstellen und beitreten</li>
        <li>Termine koordinieren</li>
        <li>Aufgaben verteilen und verfolgen</li>
        <li>Abstimmungen durchführen</li>
      </ul>
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400;">
      <span style="font-style: italic;">Viel Erfolg bei deinem Studium!</span> 🎓
    </p>
  `;
  
  return {
    subject: "Willkommen bei GroupSync! 🎉",
    html: getEmailWrapper(content),
  };
}

function getGroupInviteEmail(
  recipientName: string,
  groupName: string,
  inviterName: string,
  inviteCode: string
): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      <strong style="color: ${colors.textDark}; font-weight: 600;">${inviterName}</strong> hat dich eingeladen, der Gruppe <strong style="color: ${colors.textDark}; font-weight: 600;">"${groupName}"</strong> beizutreten!
    </p>
    
    <div style="background: ${colors.gradient}; border-radius: 12px; padding: 28px; text-align: center; margin: 24px 0;">
      <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 300;">Dein Einladungscode</p>
      <p style="color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: 6px; font-family: 'Monaco', 'Consolas', monospace;">${inviteCode}</p>
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400;">
      Gib diesen Code in <span style="text-decoration: underline; font-weight: 600;">GroupSync</span> ein, um der Gruppe beizutreten.
    </p>
  `;
  
  return {
    subject: `${inviterName} hat dich zu "${groupName}" eingeladen`,
    html: getEmailWrapper(content),
  };
}

function getTaskNotificationEmail(
  recipientName: string,
  taskTitle: string,
  taskDescription: string,
  dueDate: string,
  assignerName: string
): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      <strong style="color: ${colors.textDark}; font-weight: 600;">${assignerName}</strong> hat dir eine neue Aufgabe zugewiesen:
    </p>
    
    <div style="background: ${colors.background}; border-left: 4px solid ${colors.primary}; border-radius: 0 12px 12px 0; padding: 20px; margin: 24px 0;">
      <h3 style="color: ${colors.textDark}; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">📋 ${taskTitle}</h3>
      <p style="color: ${colors.textMuted}; margin: 0 0 16px 0; font-size: 15px; line-height: 1.5; font-style: italic;">${taskDescription || "Keine Beschreibung"}</p>
      <p style="color: ${colors.primary}; font-weight: 600; margin: 0; font-size: 15px;">
        <span style="font-weight: 600;">📅 Fällig:</span> <span style="font-weight: 400;">${dueDate || "Kein Datum festgelegt"}</span>
      </p>
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400;">
      Melde dich bei <span style="text-decoration: underline; font-weight: 600;">GroupSync</span> an, um die Aufgabe zu bearbeiten.
    </p>
  `;
  
  return {
    subject: `Neue Aufgabe: ${taskTitle}`,
    html: getEmailWrapper(content),
  };
}

function getTaskDueReminderEmail(
  recipientName: string,
  taskTitle: string,
  taskDescription: string,
  dueDate: string,
  assignerName: string
): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      <span style="font-style: italic;">Erinnerung:</span> Deine Aufgabe ist bald fällig!
    </p>
    
    <div style="background: linear-gradient(135deg, ${colors.warning} 0%, #FBBF24 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
      <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">⏰ ${taskTitle}</h3>
      <p style="margin: 0 0 16px 0; font-size: 15px; opacity: 0.95; font-style: italic; font-weight: 300;">
        ${taskDescription || "Keine Beschreibung"}
      </p>
      <p style="margin: 0; font-size: 17px; font-weight: 600;">
        <span style="font-weight: 600;">📅 Fällig am:</span> <span style="font-weight: 400;">${dueDate}</span>
      </p>
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 15px; line-height: 1.6; margin: 16px 0 0 0; font-weight: 400;">
      Aufgabe zugewiesen von: <strong style="color: ${colors.textDark}; font-weight: 600;">${assignerName}</strong>
    </p>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 16px 0 0 0; font-weight: 400;">
      Melde dich bei <span style="text-decoration: underline; font-weight: 600;">GroupSync</span> an, um die Aufgabe abzuschließen.
    </p>
  `;
  
  return {
    subject: `⏰ Aufgabe fällig: ${taskTitle}`,
    html: getEmailWrapper(content),
  };
}

function getAppointmentReminderEmail(
  recipientName: string,
  appointmentTitle: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentLocation: string
): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      <span style="font-style: italic;">Erinnerung</span> an deinen bevorstehenden Termin:
    </p>
    
    <div style="background: ${colors.gradient}; border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
      <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">📅 ${appointmentTitle}</h3>
      <p style="margin: 8px 0; font-size: 16px; font-weight: 400;">
        🗓️ <strong style="font-weight: 600;">Datum:</strong> ${appointmentDate}
      </p>
      <p style="margin: 8px 0; font-size: 16px; font-weight: 400;">
        ⏰ <strong style="font-weight: 600;">Uhrzeit:</strong> ${appointmentTime}
      </p>
      ${appointmentLocation ? `
      <p style="margin: 8px 0; font-size: 16px; font-weight: 400;">
        📍 <strong style="font-weight: 600;">Ort:</strong> ${appointmentLocation}
      </p>
      ` : ""}
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400; font-style: italic;">
      Vergiss nicht, pünktlich zu erscheinen!
    </p>
  `;
  
  return {
    subject: `Erinnerung: ${appointmentTitle}`,
    html: getEmailWrapper(content),
  };
}

function getPollReminderEmail(
  recipientName: string,
  pollTitle: string,
  endsAt: string
): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      Eine Umfrage in deiner Gruppe endet bald und du hast noch nicht abgestimmt!
    </p>
    
    <div style="background: linear-gradient(135deg, ${colors.success} 0%, #34D399 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
      <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">🗳️ ${pollTitle}</h3>
      <p style="margin: 0; font-size: 17px; font-weight: 400;">
        <span style="font-weight: 600;">⏰ Endet:</span> ${endsAt}
      </p>
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400;">
      Melde dich bei <span style="text-decoration: underline; font-weight: 600;">GroupSync</span> an, um deine Stimme abzugeben!
    </p>
  `;
  
  return {
    subject: `🗳️ Umfrage endet bald: ${pollTitle}`,
    html: getEmailWrapper(content),
  };
}

function getPollCreatedEmail(
  recipientName: string,
  pollTitle: string,
  pollDescription: string,
  creatorName: string,
  groupName: string,
  endsAt: string
): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      <strong style="color: ${colors.textDark}; font-weight: 600;">${creatorName}</strong> hat eine neue Umfrage in der Gruppe <strong style="color: ${colors.textDark}; font-weight: 600;">"${groupName}"</strong> erstellt:
    </p>
    
    <div style="background: linear-gradient(135deg, ${colors.success} 0%, #34D399 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
      <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">🗳️ ${pollTitle}</h3>
      ${pollDescription ? `<p style="margin: 0 0 12px 0; font-size: 15px; opacity: 0.95; font-style: italic; font-weight: 300;">${pollDescription}</p>` : ""}
      ${endsAt ? `<p style="margin: 0; font-size: 15px; font-weight: 400;"><strong style="font-weight: 600;">⏰ Endet:</strong> ${endsAt}</p>` : ""}
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400;">
      Melde dich bei <span style="text-decoration: underline; font-weight: 600;">GroupSync</span> an, um deine Stimme abzugeben!
    </p>
  `;
  
  return {
    subject: `🗳️ Neue Umfrage: ${pollTitle}`,
    html: getEmailWrapper(content),
  };
}

function getAppointmentCreatedEmail(
  recipientName: string,
  appointmentTitle: string,
  appointmentDescription: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentLocation: string,
  creatorName: string,
  groupName: string
): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      <strong style="color: ${colors.textDark}; font-weight: 600;">${creatorName}</strong> hat einen neuen Termin in der Gruppe <strong style="color: ${colors.textDark}; font-weight: 600;">"${groupName}"</strong> erstellt:
    </p>
    
    <div style="background: ${colors.gradient}; border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
      <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">📅 ${appointmentTitle}</h3>
      ${appointmentDescription ? `<p style="margin: 0 0 12px 0; font-size: 15px; opacity: 0.95; font-style: italic; font-weight: 300;">${appointmentDescription}</p>` : ""}
      <p style="margin: 8px 0; font-size: 16px; font-weight: 400;">
        🗓️ <strong style="font-weight: 600;">Datum:</strong> ${appointmentDate}
      </p>
      <p style="margin: 8px 0; font-size: 16px; font-weight: 400;">
        ⏰ <strong style="font-weight: 600;">Uhrzeit:</strong> ${appointmentTime}
      </p>
      ${appointmentLocation ? `
      <p style="margin: 8px 0; font-size: 16px; font-weight: 400;">
        📍 <strong style="font-weight: 600;">Ort:</strong> ${appointmentLocation}
      </p>
      ` : ""}
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400;">
      Melde dich bei <span style="text-decoration: underline; font-weight: 600;">GroupSync</span> an, um den Termin zu sehen!
    </p>
  `;
  
  return {
    subject: `📅 Neuer Termin: ${appointmentTitle}`,
    html: getEmailWrapper(content),
  };
}

function getTaskAssignedEmail(
  recipientName: string,
  taskTitle: string,
  taskDescription: string,
  dueDate: string,
  assignerName: string,
  groupName: string
): { subject: string; html: string } {
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      <strong style="color: ${colors.textDark}; font-weight: 600;">${assignerName}</strong> hat dir eine Aufgabe in der Gruppe <strong style="color: ${colors.textDark}; font-weight: 600;">"${groupName}"</strong> zugewiesen:
    </p>
    
    <div style="background: ${colors.background}; border-left: 4px solid ${colors.primary}; border-radius: 0 12px 12px 0; padding: 20px; margin: 24px 0;">
      <h3 style="color: ${colors.textDark}; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">📋 ${taskTitle}</h3>
      ${taskDescription ? `<p style="color: ${colors.textMuted}; margin: 0 0 16px 0; font-size: 15px; line-height: 1.5; font-style: italic;">${taskDescription}</p>` : ""}
      <p style="color: ${colors.primary}; margin: 0; font-size: 15px;">
        <span style="font-weight: 600;">📅 Fällig:</span> <span style="font-weight: 400;">${dueDate || "Kein Datum festgelegt"}</span>
      </p>
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400;">
      Melde dich bei <span style="text-decoration: underline; font-weight: 600;">GroupSync</span> an, um die Aufgabe zu bearbeiten.
    </p>
  `;
  
  return {
    subject: `📋 Aufgabe zugewiesen: ${taskTitle}`,
    html: getEmailWrapper(content),
  };
}

function getTaskCreatedEmail(
  recipientName: string,
  taskTitle: string,
  taskDescription: string,
  dueDate: string,
  priority: string,
  creatorName: string,
  groupName: string
): { subject: string; html: string } {
  const priorityLabels: Record<string, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch"
  };
  const priorityColors: Record<string, string> = {
    low: colors.success,
    medium: colors.warning,
    high: colors.error
  };
  
  const content = `
    <h2 style="color: ${colors.textDark}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Hallo ${recipientName}! 👋</h2>
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400;">
      <strong style="color: ${colors.textDark}; font-weight: 600;">${creatorName}</strong> hat eine neue Aufgabe in der Gruppe <strong style="color: ${colors.textDark}; font-weight: 600;">"${groupName}"</strong> erstellt:
    </p>
    
    <div style="background: ${colors.background}; border-left: 4px solid ${colors.primary}; border-radius: 0 12px 12px 0; padding: 20px; margin: 24px 0;">
      <h3 style="color: ${colors.textDark}; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">📋 ${taskTitle}</h3>
      ${taskDescription ? `<p style="color: ${colors.textMuted}; margin: 0 0 16px 0; font-size: 15px; line-height: 1.5; font-style: italic;">${taskDescription}</p>` : ""}
      <p style="margin: 0 0 12px 0; font-size: 14px;">
        <span style="background: ${priorityColors[priority] || priorityColors.medium}; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
          ${priorityLabels[priority] || priorityLabels.medium}
        </span>
      </p>
      ${dueDate ? `<p style="color: ${colors.primary}; margin: 0; font-size: 15px;"><span style="font-weight: 600;">📅 Fällig:</span> <span style="font-weight: 400;">${dueDate}</span></p>` : ""}
    </div>
    
    <p style="color: ${colors.textMuted}; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; font-weight: 400;">
      Melde dich bei <span style="text-decoration: underline; font-weight: 600;">GroupSync</span> an, um die Aufgabe zu sehen!
    </p>
  `;
  
  return {
    subject: `📋 Neue Aufgabe: ${taskTitle}`,
    html: getEmailWrapper(content),
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
      case "poll-created":
        emailContent = getPollCreatedEmail(
          recipientName,
          emailRequest.pollTitle || "Umfrage",
          emailRequest.pollDescription || "",
          emailRequest.creatorName || "Jemand",
          emailRequest.groupName || "Gruppe",
          emailRequest.endsAt || ""
        );
        break;
      case "appointment-created":
        emailContent = getAppointmentCreatedEmail(
          recipientName,
          emailRequest.appointmentTitle || "Termin",
          emailRequest.appointmentDescription || "",
          emailRequest.appointmentDate || "",
          emailRequest.appointmentTime || "",
          emailRequest.appointmentLocation || "",
          emailRequest.creatorName || "Jemand",
          emailRequest.groupName || "Gruppe"
        );
        break;
      case "task-assigned":
        emailContent = getTaskAssignedEmail(
          recipientName,
          emailRequest.taskTitle || "Aufgabe",
          emailRequest.taskDescription || "",
          emailRequest.dueDate || "",
          emailRequest.assignerName || "Jemand",
          emailRequest.groupName || "Gruppe"
        );
        break;
      case "task-created":
        emailContent = getTaskCreatedEmail(
          recipientName,
          emailRequest.taskTitle || "Aufgabe",
          emailRequest.taskDescription || "",
          emailRequest.dueDate || "",
          emailRequest.priority || "medium",
          emailRequest.creatorName || "Jemand",
          emailRequest.groupName || "Gruppe"
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
