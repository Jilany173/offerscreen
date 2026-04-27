-- Add professional metadata fields to media_playlist
ALTER TABLE media_playlist 
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS headline_style TEXT DEFAULT 'minimal',
ADD COLUMN IF NOT EXISTS qr_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qr_text TEXT,
ADD COLUMN IF NOT EXISTS is_campaign BOOLEAN DEFAULT false;
