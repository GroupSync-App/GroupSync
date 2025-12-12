-- Drop the existing policy that exposes voter identity for anonymous polls
DROP POLICY IF EXISTS "Group members can view votes" ON public.poll_votes;

-- Create a new policy that respects poll anonymity settings
-- For anonymous polls: users can only see their own votes
-- For non-anonymous polls: all group members can see all votes
CREATE POLICY "Group members can view votes respecting anonymity" 
ON public.poll_votes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM polls p 
    WHERE p.id = poll_votes.poll_id 
    AND is_group_member(p.group_id, auth.uid())
    AND (
      p.is_anonymous = false  -- Non-anonymous: anyone can see
      OR poll_votes.user_id = auth.uid()  -- Anonymous: only see own votes
    )
  )
);