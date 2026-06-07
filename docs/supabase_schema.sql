-- COMPLETE MULTI-PRODUCT ARCHITECTURE SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. Create Projects Table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Add project_id to existing tables so we can isolate data
ALTER TABLE prds ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE sprints ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- 3. Create Roadmaps Table
CREATE TABLE roadmaps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  milestone_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Create Personas Table
CREATE TABLE personas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  demographics TEXT,
  goals TEXT,
  pain_points TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Enable RLS for all new tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable public access for projects" ON projects FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable public access for roadmaps" ON roadmaps FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable public access for personas" ON personas FOR ALL USING (true) WITH CHECK (true);
