-- Migration: Sequence Persistence
-- Create a table for global app settings/sequences

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  value_int INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize the employee sequences if they don't exist
INSERT INTO app_settings (id, value_int)
VALUES 
  ('seq_FD', 0), -- Founder
  ('seq_CT', 0), -- Core Team
  ('seq_SE', 0), -- Senior Executive
  ('seq_BD', 0), -- BD Executive
  ('seq_OE', 0), -- Operations Executive
  ('seq_ME', 0), -- Marketing Executive
  ('seq_JE', 0)  -- Junior Executive
ON CONFLICT (id) DO NOTHING;

-- Grant access to authenticated users
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can do everything" ON app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
