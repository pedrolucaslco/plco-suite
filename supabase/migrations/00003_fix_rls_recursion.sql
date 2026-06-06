-- Fix RLS infinite recursion and missing policies
-- Problem: all policies used recursive subqueries on nuclei_members, and
-- auth.uid() (auth.users UUID) was compared to nuclei_members.user_id
-- (references profiles.id, not auth.users.id) — never matching.

-- ===== 1. Helper functions (SECURITY DEFINER bypasses RLS, avoids recursion) =====

CREATE OR REPLACE FUNCTION public.get_profile_id()
RETURNS UUID
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (SELECT id FROM public.profiles WHERE user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.is_nuclei_member(check_nuclei_id UUID)
RETURNS BOOLEAN
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.nuclei_members
    WHERE nuclei_members.nuclei_id = is_nuclei_member.check_nuclei_id
    AND nuclei_members.user_id = public.get_profile_id()
  );
END;
$$;

-- ===== 2. Drop old recursive policies =====

DROP POLICY IF EXISTS nuclei_member_select ON nuclei;
DROP POLICY IF EXISTS nuclei_creator_update ON nuclei;
DROP POLICY IF EXISTS nuclei_members_select ON nuclei_members;
DROP POLICY IF EXISTS tasks_member_select ON tasks;
DROP POLICY IF EXISTS tasks_member_insert ON tasks;
DROP POLICY IF EXISTS tasks_member_update ON tasks;
DROP POLICY IF EXISTS tasks_member_delete ON tasks;
DROP POLICY IF EXISTS projects_member_select ON projects;
DROP POLICY IF EXISTS projects_member_insert ON projects;
DROP POLICY IF EXISTS projects_member_update ON projects;
DROP POLICY IF EXISTS projects_member_delete ON projects;
DROP POLICY IF EXISTS areas_member_select ON areas;
DROP POLICY IF EXISTS areas_member_insert ON areas;
DROP POLICY IF EXISTS areas_member_update ON areas;
DROP POLICY IF EXISTS areas_member_delete ON areas;

-- ===== 3. Create new policies =====

-- Profiles: user can read/update own profile (unchanged)
DROP POLICY IF EXISTS profiles_self ON profiles;
CREATE POLICY profiles_self ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- ===== Nuclei =====
CREATE POLICY nuclei_insert ON nuclei
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY nuclei_select ON nuclei
  FOR SELECT USING (
    created_by = public.get_profile_id()
    OR public.is_nuclei_member(id)
  );

CREATE POLICY nuclei_update ON nuclei
  FOR UPDATE USING (created_by = public.get_profile_id());

CREATE POLICY nuclei_delete ON nuclei
  FOR DELETE USING (created_by = public.get_profile_id());

-- ===== Nuclei Members =====
CREATE POLICY nuclei_members_select ON nuclei_members
  FOR SELECT USING (public.is_nuclei_member(nuclei_id));

CREATE POLICY nuclei_members_insert ON nuclei_members
  FOR INSERT WITH CHECK (user_id = public.get_profile_id());

CREATE POLICY nuclei_members_update ON nuclei_members
  FOR UPDATE USING (user_id = public.get_profile_id());

CREATE POLICY nuclei_members_delete ON nuclei_members
  FOR DELETE USING (user_id = public.get_profile_id());

-- ===== Tasks =====
CREATE POLICY tasks_select ON tasks
  FOR SELECT USING (public.is_nuclei_member(nuclei_id));

CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (public.is_nuclei_member(nuclei_id));

CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (public.is_nuclei_member(nuclei_id));

CREATE POLICY tasks_delete ON tasks
  FOR DELETE USING (public.is_nuclei_member(nuclei_id));

-- ===== Projects =====
CREATE POLICY projects_select ON projects
  FOR SELECT USING (public.is_nuclei_member(nuclei_id));

CREATE POLICY projects_insert ON projects
  FOR INSERT WITH CHECK (public.is_nuclei_member(nuclei_id));

CREATE POLICY projects_update ON projects
  FOR UPDATE USING (public.is_nuclei_member(nuclei_id));

CREATE POLICY projects_delete ON projects
  FOR DELETE USING (public.is_nuclei_member(nuclei_id));

-- ===== Areas =====
CREATE POLICY areas_select ON areas
  FOR SELECT USING (public.is_nuclei_member(nuclei_id));

CREATE POLICY areas_insert ON areas
  FOR INSERT WITH CHECK (public.is_nuclei_member(nuclei_id));

CREATE POLICY areas_update ON areas
  FOR UPDATE USING (public.is_nuclei_member(nuclei_id));

CREATE POLICY areas_delete ON areas
  FOR DELETE USING (public.is_nuclei_member(nuclei_id));
