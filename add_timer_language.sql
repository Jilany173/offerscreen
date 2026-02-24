-- Add timer_language column to themes table
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS timer_language TEXT DEFAULT 'bn' CHECK (timer_language IN ('en', 'bn'));

-- Update existing themes to have 'bn' as default
UPDATE themes SET timer_language = 'bn' WHERE timer_language IS NULL;
