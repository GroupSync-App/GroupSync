-- Step 1: Create security definer function to check group membership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id
  )
$$;

-- Step 2: Drop old problematic policies on group_members
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- Step 3: Drop old problematic policies on groups
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups by invite code" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group owners can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group owners can delete their groups" ON public.groups;

-- Step 4: Create new non-recursive policies for group_members
CREATE POLICY "Members can view group members"
ON public.group_members
FOR SELECT
USING (public.is_group_member(group_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (auth.uid() = user_id);

-- Step 5: Create new non-recursive policies for groups
CREATE POLICY "Anyone can view groups"
ON public.groups
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners can update their groups"
ON public.groups
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Group owners can delete their groups"
ON public.groups
FOR DELETE
USING (auth.uid() = created_by);