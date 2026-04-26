-- Create ticker_messages table
CREATE TABLE IF NOT EXISTS public.ticker_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    message text NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Insert example messages
INSERT INTO public.ticker_messages (message, sort_order)
VALUES 
    ('🚀 Welcome to Hexa''s Zindabazar - Get the best deals on our courses!', 0),
    ('🔥 Special RAMADAN Discounts available now! Grab your coupon!', 1),
    ('📞 Call us at 017xx-xxxxxx for more info and registration!', 2)
ON CONFLICT DO NOTHING;

-- Set up RLS
ALTER TABLE public.ticker_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on ticker_messages"
ON public.ticker_messages FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage ticker_messages"
ON public.ticker_messages FOR ALL
TO public
USING (true)
WITH CHECK (true);
