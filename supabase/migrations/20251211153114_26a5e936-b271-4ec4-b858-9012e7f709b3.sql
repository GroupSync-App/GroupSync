-- Create a view for public profile data (without sensitive email)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  display_name,
  university,
  faculty,
  study_program,
  semester,
  bio,
  skills,
  avatar_url,
  availability,
  preferred_group_size,
  profile_completed,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;

-- Drop the existing SELECT policy that exposes email to group members
DROP POLICY IF EXISTS "Authenticated users can view own and group members profiles" ON public.profiles;

-- Create new policy: Users can only see their own FULL profile (including email)
CREATE POLICY "Users can view their own full profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Create a security definer function to get group member profiles without email
CREATE OR REPLACE FUNCTION public.get_group_member_profiles(_group_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  university text,
  faculty text,
  study_program text,
  semester integer,
  bio text,
  skills text[],
  avatar_url text,
  availability jsonb,
  preferred_group_size integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.university,
    p.faculty,
    p.study_program,
    p.semester,
    p.bio,
    p.skills,
    p.avatar_url,
    p.availability,
    p.preferred_group_size
  FROM profiles p
  INNER JOIN group_members gm ON gm.user_id = p.id
  WHERE gm.group_id = _group_id
    AND EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = _group_id 
      AND user_id = auth.uid()
    )
$$;