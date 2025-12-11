-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Service role can manage reminders" ON public.email_reminders_sent;

-- Create restrictive policies that only allow service role access
-- The service role bypasses RLS, so we create a policy that denies all regular user access
CREATE POLICY "No public access to reminders"
ON public.email_reminders_sent
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Ensure anon users also cannot access
CREATE POLICY "No anonymous access to reminders"
ON public.email_reminders_sent
FOR ALL
TO anon
USING (false)
WITH CHECK (false);