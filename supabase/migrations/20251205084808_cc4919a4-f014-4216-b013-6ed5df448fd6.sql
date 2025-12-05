-- Create tasks table for group tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only group members can access tasks
CREATE POLICY "Group members can view tasks"
ON public.tasks
FOR SELECT
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Group members can create tasks"
ON public.tasks
FOR INSERT
WITH CHECK (public.is_group_member(group_id, auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Group members can update tasks"
ON public.tasks
FOR UPDATE
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Task creators can delete tasks"
ON public.tasks
FOR DELETE
USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_tasks_group_id ON public.tasks(group_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);