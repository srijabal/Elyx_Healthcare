-- ========================================
-- ELYX HACKATHON - SUPABASE TABLE SETUP
-- ========================================
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. MEMBERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    occupation VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    health_goals TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_location ON members(location);

-- ========================================
-- 2. AGENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    persona_prompt TEXT
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);

-- ========================================
-- 3. MESSAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context_data JSONB
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_member_id ON messages(member_id);
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_context_month ON messages USING GIN((context_data->'month'));

-- ========================================
-- 4. HEALTH EVENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS health_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    event_type VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    results JSONB,
    related_agents UUID[]
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_events_member_id ON health_events(member_id);
CREATE INDEX IF NOT EXISTS idx_health_events_date ON health_events(event_date);
CREATE INDEX IF NOT EXISTS idx_health_events_type ON health_events(event_type);

-- ========================================
-- 5. JOURNEY STATE TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS journey_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    biomarkers JSONB,
    current_interventions JSONB,
    progress_metrics JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_journey_state_member_id ON journey_state(member_id);
CREATE INDEX IF NOT EXISTS idx_journey_state_month ON journey_state(month);
CREATE UNIQUE INDEX IF NOT EXISTS idx_journey_state_member_month ON journey_state(member_id, month);

-- ========================================
-- 6. ROW LEVEL SECURITY (Optional but recommended)
-- ========================================
-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_state ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (suitable for demo/hackathon)
-- In production, you'd want more restrictive policies

CREATE POLICY "Allow all operations on members" ON members
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on agents" ON agents
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on messages" ON messages
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on health_events" ON health_events
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on journey_state" ON journey_state
    FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 7. INSERT INITIAL AGENT DATA
-- ========================================
INSERT INTO agents (name, role, specialty) VALUES
    ('Dr. Warren', 'The Medical Strategist', 'Clinical Authority & Medical Direction'),
    ('Ruby', 'The Concierge / Orchestrator', 'Logistics Coordination & Client Experience'),
    ('Advik', 'The Performance Scientist', 'Data Analysis & Performance Optimization'),
    ('Carla', 'The Nutritionist', 'Fuel Pillar & Nutrition Strategy'),
    ('Rachel', 'The PT / Physiotherapist', 'Chassis & Physical Movement'),
    ('Neel', 'The Concierge Lead / Relationship Manager', 'Strategic Leadership & Relationship Management')
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. VERIFICATION QUERIES
-- ========================================
-- Run these to verify setup worked correctly

-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('members', 'agents', 'messages', 'health_events', 'journey_state')
ORDER BY table_name;

-- Check agents were inserted
SELECT name, role, specialty FROM agents ORDER BY name;

-- Check indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('members', 'agents', 'messages', 'health_events', 'journey_state')
ORDER BY tablename, indexname;
