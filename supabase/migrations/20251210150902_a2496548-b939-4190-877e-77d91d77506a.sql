-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Task creators can delete tasks" ON tasks;

-- Create new policy allowing task creators and group owners to delete tasks
CREATE POLICY "Task creators and group owners can delete tasks" ON tasks
FOR DELETE USING (
  auth.uid() = created_by 
  OR 
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = tasks.group_id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'owner'
  )
);