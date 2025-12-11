-- Drop the profiles_public view that bypasses RLS
-- The application uses get_group_member_profiles() RPC function for secure profile access
DROP VIEW IF EXISTS public.profiles_public;