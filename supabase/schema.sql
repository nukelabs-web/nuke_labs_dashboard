-- NukeLabs Dashboard Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Junior Executive',
  email TEXT UNIQUE NOT NULL,
  department TEXT,
  assigned_tasks INTEGER DEFAULT 0,
  assigned_colleges INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COLLEGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  department TEXT,
  lead_source TEXT,
  lead_status TEXT NOT NULL DEFAULT 'New Lead',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  organization TEXT,
  city TEXT NOT NULL,
  skills TEXT,
  workshops_can_teach TEXT,
  phone TEXT,
  email TEXT,
  workshops_conducted INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  availability_status TEXT DEFAULT 'Available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKSHOPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id TEXT UNIQUE,
  college_name TEXT NOT NULL,
  city TEXT NOT NULL,
  workshop_type TEXT NOT NULL,
  workshop_date DATE NOT NULL,
  trainer_name TEXT,
  expected_students INTEGER DEFAULT 0,
  actual_students INTEGER,
  status TEXT NOT NULL DEFAULT 'Planned',
  responsible TEXT,
  notes TEXT,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_person TEXT,
  department TEXT,
  priority TEXT DEFAULT 'Medium',
  deadline DATE,
  status TEXT DEFAULT 'Pending',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  total_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  in_use_quantity INTEGER DEFAULT 0,
  damaged_units INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKSHOP_KITS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workshop_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  kit_id UUID REFERENCES kits(id) ON DELETE CASCADE,
  quantity_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKSHOP_FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workshop_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  rating DECIMAL(2,1),
  feedback_text TEXT,
  student_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES (Basic — allow authenticated users)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_feedback ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Authenticated users can do everything" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON colleges FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON workshops FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON trainers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON kits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON workshop_kits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON workshop_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);
