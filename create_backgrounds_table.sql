-- Create background_images table
CREATE TABLE IF NOT EXISTS background_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE background_images ENABLE ROW LEVEL SECURITY;

-- Create policies (Public Read, Authenticated Write)
CREATE POLICY "Public Read Access" ON background_images FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert/Update/Delete" ON background_images FOR ALL USING (auth.role() = 'authenticated');

-- Note: Storage bucket 'background-images' should be created manually in Supabase Dashboard with Public Access enabled.
