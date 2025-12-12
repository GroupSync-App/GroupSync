-- Create group_links table for storing multiple Drive links per group
CREATE TABLE public.group_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  url text NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster lookups by group
CREATE INDEX idx_group_links_group_id ON public.group_links(group_id);

-- Enable Row Level Security
ALTER TABLE public.group_links ENABLE ROW LEVEL SECURITY;

-- Group members can view all links in their groups
CREATE POLICY "Group members can view links"
ON public.group_links FOR SELECT
USING (is_group_member(group_id, auth.uid()));

-- Group members can add links to their groups
CREATE POLICY "Group members can add links"
ON public.group_links FOR INSERT
WITH CHECK (
  is_group_member(group_id, auth.uid()) 
  AND auth.uid() = created_by
);

-- Only the link creator can update their own links
CREATE POLICY "Link creators can update their links"
ON public.group_links FOR UPDATE
USING (auth.uid() = created_by);

-- Only the link creator can delete their own links
CREATE POLICY "Link creators can delete their links"
ON public.group_links FOR DELETE
USING (auth.uid() = created_by);

-- Migrate existing drive_link from groups table to group_links
INSERT INTO public.group_links (group_id, created_by, url, title)
SELECT id, created_by, drive_link, 'Google Drive'
FROM public.groups
WHERE drive_link IS NOT NULL AND drive_link != '';