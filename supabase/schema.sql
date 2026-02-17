
-- Create the offers table
CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  original_price NUMERIC NOT NULL,
  discounted_price NUMERIC NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Insert a sample offer
INSERT INTO offers (title, original_price, discounted_price, end_time, is_active)
VALUES (
  'Ramadan Special <br/> <span class="text-brand-red">Jackpot Offer</span>',
  500,
  199,
  NOW() + INTERVAL '150 hours',
  TRUE
);

-- Enable Row Level Security (RLS)
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read offers
CREATE POLICY "Enable read access for all users" ON offers
FOR SELECT USING (true);
