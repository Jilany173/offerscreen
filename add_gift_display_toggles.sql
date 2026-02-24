-- Add gift display toggles to themes table
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS show_gift_marquee BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_gift_popups BOOLEAN DEFAULT true;
