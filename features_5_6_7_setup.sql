-- Feature 5, 6, 7 Database Expansion
-- Run this in Supabase SQL Editor

ALTER TABLE media_playlist 
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'none', -- names: 'none', 'ielts_success', 'special_offer'
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS student_score TEXT,
ADD COLUMN IF NOT EXISTS badge_text TEXT;

-- Heartbeat monitoring table for System Health
CREATE TABLE IF NOT EXISTS system_health (
    id TEXT PRIMARY KEY,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'online'
);

-- Initialize the main screen health record
INSERT INTO system_health (id, status) VALUES ('main_display', 'online')
ON CONFLICT (id) DO NOTHING;
