-- Enable Realtime for the tasks table so clients get live updates
-- The publication may not exist in older/self-hosted projects, so create it first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
