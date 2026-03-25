-- Multi-Role and Multi-Department Support Migration
-- Run this in the Supabase SQL Editor

-- 1. Convert position to TEXT[]
ALTER TABLE users 
ALTER COLUMN position TYPE TEXT[] 
USING (CASE WHEN position IS NULL THEN ARRAY[]::TEXT[] ELSE ARRAY[position] END);

ALTER TABLE users 
ALTER COLUMN position SET DEFAULT ARRAY['Junior Executive']::TEXT[];

-- 2. Convert department to TEXT[]
ALTER TABLE users 
ALTER COLUMN department TYPE TEXT[] 
USING (CASE WHEN department IS NULL THEN ARRAY[]::TEXT[] ELSE ARRAY[department] END);

ALTER TABLE users 
ALTER COLUMN department SET DEFAULT ARRAY[]::TEXT[];

-- 3. Update existing data to ensure no NULLs and proper array format
UPDATE users SET position = ARRAY['Junior Executive']::TEXT[] WHERE position IS NULL OR array_length(position, 1) IS NULL;
UPDATE users SET department = ARRAY[]::TEXT[] WHERE department IS NULL;

-- 4. Audit Role Change Log (Optional: keep as singular for history or convert? 
-- Usually history entries are single events, so we keep them as is mapping "Old Role" (singular) to "New Roles" (array if needed, but let's keep singular for event clarity).

-- 5. Verification
-- SELECT name, position, department FROM users;
