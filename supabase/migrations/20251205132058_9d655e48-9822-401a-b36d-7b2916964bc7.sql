-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  allow_multiple_votes BOOLEAN NOT NULL DEFAULT false,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, option_id, user_id)
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Group members can view polls"
ON public.polls FOR SELECT
USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Group members can create polls"
ON public.polls FOR INSERT
WITH CHECK (is_group_member(group_id, auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Poll creators can update polls"
ON public.polls FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Poll creators can delete polls"
ON public.polls FOR DELETE
USING (auth.uid() = created_by);

-- Poll options policies
CREATE POLICY "Group members can view poll options"
ON public.poll_options FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.polls p 
  WHERE p.id = poll_id AND is_group_member(p.group_id, auth.uid())
));

CREATE POLICY "Poll creators can manage options"
ON public.poll_options FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.polls p 
  WHERE p.id = poll_id AND p.created_by = auth.uid()
));

CREATE POLICY "Poll creators can delete options"
ON public.poll_options FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.polls p 
  WHERE p.id = poll_id AND p.created_by = auth.uid()
));

-- Poll votes policies
CREATE POLICY "Group members can view votes"
ON public.poll_votes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.polls p 
  WHERE p.id = poll_id AND is_group_member(p.group_id, auth.uid())
));

CREATE POLICY "Group members can vote"
ON public.poll_votes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.polls p 
    WHERE p.id = poll_id AND is_group_member(p.group_id, auth.uid())
  )
);

CREATE POLICY "Users can remove their votes"
ON public.poll_votes FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_polls_updated_at
BEFORE UPDATE ON public.polls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();