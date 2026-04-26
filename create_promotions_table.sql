-- ============================================================
-- Promotions Table — অফিস প্রমোশন, নোটিশ, অ্যাচিভমেন্ট
-- ============================================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,           -- e.g. "নতুন ব্যাচ শুরু!"
  subtitle TEXT,                 -- e.g. "মার্চ ২০২৬"
  content TEXT,                  -- বিস্তারিত বিবরণ
  type TEXT DEFAULT 'notice',    -- 'notice' | 'achievement' | 'event'
  emoji TEXT DEFAULT '📢',       -- ইমোজি
  image_url TEXT,                -- ছবি (ঐচ্ছিক)
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Public can read active promotions
CREATE POLICY "Public read promotions"
  ON promotions FOR SELECT
  USING (true);

-- Only authenticated users can write
CREATE POLICY "Auth write promotions"
  ON promotions FOR ALL
  USING (auth.role() = 'authenticated');
