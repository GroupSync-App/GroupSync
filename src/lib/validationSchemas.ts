import { z } from "zod";

// Group validation schema
export const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Gruppenname ist erforderlich").max(100, "Gruppenname darf maximal 100 Zeichen haben"),
  description: z.string().max(500, "Beschreibung darf maximal 500 Zeichen haben").optional(),
  subject: z.string().optional(),
  max_members: z.number().min(2).max(10),
  deadline: z.string().optional(),
});

// Task validation schema
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Titel ist erforderlich").max(200, "Titel darf maximal 200 Zeichen haben"),
  description: z.string().max(1000, "Beschreibung darf maximal 1000 Zeichen haben").optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
});

// Appointment validation schema
export const createAppointmentSchema = z.object({
  title: z.string().trim().min(1, "Titel ist erforderlich").max(200, "Titel darf maximal 200 Zeichen haben"),
  description: z.string().max(1000, "Beschreibung darf maximal 1000 Zeichen haben").optional(),
  location: z.string().max(200, "Ort darf maximal 200 Zeichen haben").optional(),
  start_time: z.string().min(1, "Startzeit ist erforderlich"),
  end_time: z.string().optional(),
}).refine((data) => {
  if (data.end_time && data.start_time) {
    return new Date(data.end_time) > new Date(data.start_time);
  }
  return true;
}, {
  message: "Endzeit muss nach der Startzeit liegen",
  path: ["end_time"],
});

// Profile setup validation schema
export const profileSetupSchema = z.object({
  university: z.string().min(1, "Universität ist erforderlich"),
  study_program: z.string().min(1, "Studiengang ist erforderlich"),
  semester: z.number().min(1, "Semester ist erforderlich").max(12, "Semester darf maximal 12 sein"),
  skills: z.array(z.string()).optional(),
  availability: z.record(z.array(z.string())).optional(),
  preferred_group_size: z.number().min(2).max(8),
});

// Profile edit validation schema
export const profileEditSchema = z.object({
  display_name: z.string().max(100, "Anzeigename darf maximal 100 Zeichen haben").optional(),
  university: z.string().max(200, "Universität darf maximal 200 Zeichen haben").optional(),
  faculty: z.string().max(200, "Fakultät darf maximal 200 Zeichen haben").optional(),
  study_program: z.string().max(200, "Studiengang darf maximal 200 Zeichen haben").optional(),
  semester: z.number().min(1).max(12).nullable().optional(),
  bio: z.string().max(1000, "Bio darf maximal 1000 Zeichen haben").optional(),
  skills: z.array(z.string()).optional(),
  availability: z.record(z.array(z.string())).optional(),
  preferred_group_size: z.number().min(2).max(8),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
