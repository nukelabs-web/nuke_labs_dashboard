-- Position and Rank Management Extension
-- Run this AFTER schema.sql in the Supabase SQL Editor

-- ============================================
-- ADD POSITION FIELDS TO USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'Junior Executive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- ============================================
-- ADD TRAINER LEVEL TO TRAINERS TABLE
-- ============================================
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS trainer_level TEXT DEFAULT 'Associate Trainer';

-- ============================================
-- ROLE CHANGE LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT NOT NULL,
  employee_name TEXT,
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  change_type TEXT DEFAULT 'Promotion',
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINER PROMOTION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trainer_promotion_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  trainer_name TEXT,
  old_level TEXT NOT NULL,
  new_level TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROLES CONFIG TABLE (for admin customization)
-- ============================================
CREATE TABLE IF NOT EXISTS roles_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name TEXT NOT NULL UNIQUE,
  rank_level INTEGER NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_promotion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything" ON role_change_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON trainer_promotion_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON roles_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- SEED DEFAULT ROLES CONFIG
-- ============================================
INSERT INTO roles_config (role_name, rank_level, permissions) VALUES
  ('Founder', 1, '{"fullAccess": true, "promote": true, "editRoles": true, "manageUsers": true}'),
  ('Core Team', 2, '{"fullAccess": false, "promote": false, "assignTasks": true, "assignWorkshops": true, "assignColleges": true, "viewAll": true}'),
  ('Senior Executive', 3, '{"assignTasks": true, "assignWorkshops": true, "assignColleges": true, "viewAll": true}'),
  ('Business Development Executive', 4, '{"viewAll": false}'),
  ('Operations Executive', 5, '{"viewAll": false}'),
  ('Marketing Executive', 6, '{"viewAll": false}'),
  ('Junior Executive', 7, '{"viewAll": false}')
ON CONFLICT (role_name) DO NOTHING;

-- ============================================
-- SEED EMPLOYEE IDS & POSITIONS FOR EXISTING USERS
-- ============================================
UPDATE users SET employee_id = 'NL-25-AD-001', position = 'Founder', status = 'Active' WHERE email = 'ankit@nukelabs.in';
UPDATE users SET employee_id = 'NL-25-CT-002', position = 'Core Team', status = 'Active' WHERE email = 'meera@nukelabs.in';
UPDATE users SET employee_id = 'NL-25-BD-003', position = 'Business Development Executive', status = 'Active' WHERE email = 'rohan@nukelabs.in';
UPDATE users SET employee_id = 'NL-25-JE-004', position = 'Junior Executive', status = 'Active' WHERE email = 'sneha@nukelabs.in';
UPDATE users SET employee_id = 'NL-25-CT-005', position = 'Core Team', status = 'Active' WHERE email = 'priya@nukelabs.in';

-- Seed trainer levels
UPDATE trainers SET trainer_level = 'Senior Trainer' WHERE name = 'Rahul Sharma';
UPDATE trainers SET trainer_level = 'Trainer' WHERE name = 'Priya Patel';
UPDATE trainers SET trainer_level = 'Trainer' WHERE name = 'Arun Kumar';
UPDATE trainers SET trainer_level = 'Senior Trainer' WHERE name = 'Sneha Reddy';
UPDATE trainers SET trainer_level = 'Associate Trainer' WHERE name = 'Vikram Singh';

-- Seed some role change history
INSERT INTO role_change_log (employee_id, employee_name, old_role, new_role, change_type, changed_by) VALUES
  ('NL-25-BD-003', 'Rohan Gupta', 'Junior Executive', 'Business Development Executive', 'Promotion', 'Ankit Verma'),
  ('NL-25-CT-002', 'Meera Joshi', 'Senior Executive', 'Core Team', 'Promotion', 'Ankit Verma');

-- Seed some trainer promotion history
INSERT INTO trainer_promotion_log (trainer_name, old_level, new_level, changed_by) VALUES
  ('Rahul Sharma', 'Trainer', 'Senior Trainer', 'Ankit Verma'),
  ('Sneha Reddy', 'Associate Trainer', 'Trainer', 'Meera Joshi'),
  ('Sneha Reddy', 'Trainer', 'Senior Trainer', 'Ankit Verma');
