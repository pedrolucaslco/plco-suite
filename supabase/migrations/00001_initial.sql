-- PLCO Suite — Initial Schema
-- Run this in Supabase SQL Editor

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  avatar_url TEXT,
  role       TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Family nuclei
CREATE TABLE nuclei (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nuclei ENABLE ROW LEVEL SECURITY;

-- Nuclei members
CREATE TABLE nuclei_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nuclei_id  UUID REFERENCES nuclei(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role       TEXT CHECK (role IN ('father', 'mother', 'guardian', 'child', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(nuclei_id, user_id)
);

ALTER TABLE nuclei_members ENABLE ROW LEVEL SECURITY;

-- Areas (life roles, never complete)
CREATE TABLE areas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nuclei_id  UUID REFERENCES nuclei(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Projects (finite goals)
CREATE TABLE projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nuclei_id  UUID REFERENCES nuclei(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  area_id    UUID REFERENCES areas(id) ON DELETE SET NULL,
  position   INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Tasks (Things-inspired sections)
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nuclei_id     UUID REFERENCES nuclei(id) ON DELETE CASCADE NOT NULL,
  created_by    UUID REFERENCES profiles(id),
  title         TEXT NOT NULL,
  description   TEXT,
  section       TEXT CHECK (section IN ('inbox', 'today', 'upcoming', 'anytime', 'someday')) DEFAULT 'inbox',
  due_date      DATE,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  area_id       UUID REFERENCES areas(id) ON DELETE SET NULL,
  is_completed  BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  position      INT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_nuclei_members_user ON nuclei_members(user_id);
CREATE INDEX idx_nuclei_members_nuclei ON nuclei_members(nuclei_id);
CREATE INDEX idx_tasks_nuclei_section ON tasks(nuclei_id, section);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_projects_nuclei ON projects(nuclei_id);
CREATE INDEX idx_areas_nuclei ON areas(nuclei_id);

-- Helper: profiles.id for the current authenticated user
-- Needed because nuclei_members.user_id references profiles(id), not auth.users(id)
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

-- Helper: check if current user is a member of a given nucleus
-- Uses SECURITY DEFINER to avoid recursion when used in RLS policies
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

-- RLS Policies

-- Profiles: user can read/update own profile
CREATE POLICY profiles_self ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- ===== Nuclei =====
-- Any authenticated user can create a nucleus
CREATE POLICY nuclei_insert ON nuclei
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Creator or member can read
CREATE POLICY nuclei_select ON nuclei
  FOR SELECT USING (
    created_by = public.get_profile_id()
    OR public.is_nuclei_member(id)
  );

-- Creator can update
CREATE POLICY nuclei_update ON nuclei
  FOR UPDATE USING (created_by = public.get_profile_id());

-- Creator can delete
CREATE POLICY nuclei_delete ON nuclei
  FOR DELETE USING (created_by = public.get_profile_id());

-- ===== Nuclei Members =====
-- User can read members of nuclei they belong to
CREATE POLICY nuclei_members_select ON nuclei_members
  FOR SELECT USING (public.is_nuclei_member(nuclei_id));

-- User can insert themselves as a member of a nucleus
CREATE POLICY nuclei_members_insert ON nuclei_members
  FOR INSERT WITH CHECK (user_id = public.get_profile_id());

-- User can update/delete their own membership
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

-- Auto-create profile on signup
-- Schema-qualified to avoid search_path issues when trigger fires in auth context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
