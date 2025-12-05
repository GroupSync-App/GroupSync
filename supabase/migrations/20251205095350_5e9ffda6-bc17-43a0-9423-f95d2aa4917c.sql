-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows viewing own profile and profiles of group members
CREATE POLICY "Users can view own and group members profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
    AND gm2.user_id = profiles.id
  )
);