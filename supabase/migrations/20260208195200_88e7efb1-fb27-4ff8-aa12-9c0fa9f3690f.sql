-- Fix infinite recursion in team_members policies
-- The issue is that leads policy references team_members, and team_members references itself

-- First, drop the problematic policies on team_members
DROP POLICY IF EXISTS "Team members can view their team members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can add members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can update members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can remove members" ON public.team_members;

-- Create a security definer function to check team membership without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_team_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = p_user_id;
$$;

-- Create a function to check if user is team admin
CREATE OR REPLACE FUNCTION public.is_team_admin(p_team_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = p_team_id 
    AND user_id = p_user_id 
    AND role IN ('owner', 'admin')
  );
$$;

-- Recreate team_members policies using the security definer function
CREATE POLICY "Team members can view their team members"
ON public.team_members
FOR SELECT
USING (team_id IN (SELECT public.get_user_team_ids(auth.uid())));

CREATE POLICY "Team admins can add members"
ON public.team_members
FOR INSERT
WITH CHECK (public.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can update members"
ON public.team_members
FOR UPDATE
USING (public.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can remove members"
ON public.team_members
FOR DELETE
USING (public.is_team_admin(team_id, auth.uid()) OR user_id = auth.uid());

-- Update leads policy to use the function instead of direct subquery
DROP POLICY IF EXISTS "Team members can view team leads" ON public.leads;

CREATE POLICY "Team members can view team leads"
ON public.leads
FOR SELECT
USING (user_id = auth.uid() OR team_id IN (SELECT public.get_user_team_ids(auth.uid())));