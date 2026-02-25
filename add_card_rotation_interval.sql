-- Add card_rotation_interval column to themes table
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS card_rotation_interval INTEGER DEFAULT 6;

-- Update existing themes to have the default value
UPDATE themes SET card_rotation_interval = 6 WHERE card_rotation_interval IS NULL;
