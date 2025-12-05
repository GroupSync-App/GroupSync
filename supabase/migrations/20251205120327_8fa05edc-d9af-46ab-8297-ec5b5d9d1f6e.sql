-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;

-- Create new policy: Only allow authenticated users who are members to see groups
-- OR allow authenticated users to view groups by invite code (for joining)
CREATE POLICY "Group members can view their groups"
ON public.groups
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    -- User is a member of the group
    is_group_member(id, auth.uid()) OR
    -- User is the creator
    auth.uid() = created_by
  )
);

-- Create a separate function to look up group by invite code (for joining)
CREATE OR REPLACE FUNCTION public.get_group_by_invite_code(_invite_code text)
RETURNS TABLE (
  id uuid,
  name text,
  subject text,
  description text,
  max_members integer,
  deadline date,
  member_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    g.id,
    g.name,
    g.subject,
    g.description,
    g.max_members,
    g.deadline,
    (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count
  FROM groups g
  WHERE g.invite_code = _invite_code
$$;