-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view own and group members profiles" ON public.profiles;

-- Create updated SELECT policy that explicitly requires authentication
CREATE POLICY "Authenticated users can view own and group members profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = id) 
  OR (EXISTS (
    SELECT 1
    FROM group_members gm1
    JOIN group_members gm2 ON (gm1.group_id = gm2.group_id)
    WHERE (gm1.user_id = auth.uid()) AND (gm2.user_id = profiles.id)
  ))
);