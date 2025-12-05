-- Create appointments table for group meetings
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Group members can view appointments
CREATE POLICY "Group members can view appointments"
ON public.appointments
FOR SELECT
USING (is_group_member(group_id, auth.uid()));

-- Group members can create appointments
CREATE POLICY "Group members can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (is_group_member(group_id, auth.uid()) AND auth.uid() = created_by);

-- Group members can update appointments
CREATE POLICY "Group members can update appointments"
ON public.appointments
FOR UPDATE
USING (is_group_member(group_id, auth.uid()));

-- Creators can delete their appointments
CREATE POLICY "Creators can delete appointments"
ON public.appointments
FOR DELETE
USING (auth.uid() = created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();