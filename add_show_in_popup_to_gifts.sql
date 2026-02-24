-- Add show_in_popup column to gift_items table
ALTER TABLE gift_items 
ADD COLUMN IF NOT EXISTS show_in_popup BOOLEAN DEFAULT false;

-- Update existing items to have it as false (default is already set, but just in case)
UPDATE gift_items SET show_in_popup = false WHERE show_in_popup IS NULL;
