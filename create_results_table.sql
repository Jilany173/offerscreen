-- ============================================================
-- Result Announcements Table — স্টুডেন্ট রেজাল্ট সামারি
-- e.g. "ফেব্রুয়ারি ২০২৬: ১০০ জন ৬+ স্কোর অর্জন করেছেন"
-- score_breakdown: [{"score": "৬", "count": "৫০ জন"}, ...]
-- ============================================================
CREATE TABLE IF NOT EXISTS result_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,           -- e.g. "ফেব্রুয়ারি ২০২৬"
  headline TEXT NOT NULL,        -- e.g. "১০০ জন শিক্ষার্থী ৬+ স্কোর অর্জন করেছেন"
  score_breakdown JSONB,         -- e.g. [{"score": "৬", "count": "৫০ জন"}, {"score": "৭", "count": "২০ জন"}]
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE result_announcements ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public read results"
  ON result_announcements FOR SELECT
  USING (true);

-- Only authenticated users can write
CREATE POLICY "Auth write results"
  ON result_announcements FOR ALL
  USING (auth.role() = 'authenticated');
