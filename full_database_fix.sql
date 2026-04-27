-- Full migration to ensure all professional features work
-- Run this in your Supabase SQL Editor

ALTER TABLE media_playlist 
ADD COLUMN IF NOT EXISTS group_id UUID,
ADD COLUMN IF NOT EXISTS group_title TEXT,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS headline_style TEXT DEFAULT 'minimal',
ADD COLUMN IF NOT EXISTS qr_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qr_text TEXT,
ADD COLUMN IF NOT EXISTS is_campaign BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS active_days JSONB DEFAULT '[0,1,2,3,4,5,6]'; 

-- Also ensure signage_settings table exists for widgets
CREATE TABLE IF NOT EXISTS signage_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default settings if they don't exist
INSERT INTO signage_settings (key, value) VALUES 
('show_clock', 'true'),
('show_weather', 'true'),
('show_logo', 'true'),
('weather_city', 'Sylhet'),
('show_qr', 'true'),
('ticker_label', 'LATEST UPDATE'),
('ticker_speed', '20'),
('show_ticker', 'true')
ON CONFLICT (key) DO NOTHING;

-- Ticker messages table
CREATE TABLE IF NOT EXISTS ticker_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
