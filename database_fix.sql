-- DROP existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access on signage_settings" ON signage_settings;
DROP POLICY IF EXISTS "Allow authenticated users to manage signage_settings" ON signage_settings;
DROP POLICY IF EXISTS "Allow public read access on ticker_messages" ON ticker_messages;
DROP POLICY IF EXISTS "Allow authenticated users to manage ticker_messages" ON ticker_messages;

-- Simplified Settings Table
CREATE TABLE IF NOT EXISTS public.signage_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Simplified Ticker Table
CREATE TABLE IF NOT EXISTS public.ticker_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    message text NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Insert Default Settings
INSERT INTO public.signage_settings (key, value)
VALUES 
    ('show_clock', 'true'),
    ('show_weather', 'true'),
    ('show_logo', 'true'),
    ('weather_city', 'Sylhet'),
    ('qr_code_url', 'https://hz.jkcshiru.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insert Default Ticker Message
INSERT INTO public.ticker_messages (message, is_active, sort_order)
VALUES ('🚀 Welcome to Hexa''s Zindabazar Digital Signage - Experience the best education and technology!', true, 0)
ON CONFLICT DO NOTHING;

-- Enable RLS and set ultra-permissive policies for local dev
ALTER TABLE public.signage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticker_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signage_settings_permissive" ON public.signage_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ticker_messages_permissive" ON public.ticker_messages FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT ALL ON TABLE public.signage_settings TO anon, authenticated, postgres;
GRANT ALL ON TABLE public.ticker_messages TO anon, authenticated, postgres;
