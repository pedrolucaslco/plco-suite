-- Add updated_at to projects and areas for schema consistency
ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE areas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_areas_updated_at
  BEFORE UPDATE ON areas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
