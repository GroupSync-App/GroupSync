-- Add Google Drive link column to groups table
ALTER TABLE public.groups ADD COLUMN drive_link text;

-- Add comment for documentation
COMMENT ON COLUMN public.groups.drive_link IS 'Google Drive folder URL for the group';