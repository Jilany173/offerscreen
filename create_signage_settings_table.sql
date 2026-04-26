-- Create signage_settings table
CREATE TABLE IF NOT EXISTS public.signage_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert default settings
INSERT INTO public.signage_settings (key, value)
VALUES 
    ('ticker_text', '🚀 Welcome to Hexa''s Zindabazar - Get the best deals on our courses! • Special RAMADAN Discounts available now!'),
    ('show_clock', 'true'),
    ('show_weather', 'true'),
    ('show_logo', 'true'),
    ('weather_city', 'Sylhet'),
    ('qr_code_url', 'https://hz.jkcshiru.com')
ON CONFLICT (key) DO NOTHING;

-- Set up RLS
ALTER TABLE public.signage_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on signage_settings"
ON public.signage_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage signage_settings"
ON public.signage_settings FOR ALL
TO public
USING (true)
WITH CHECK (true);
