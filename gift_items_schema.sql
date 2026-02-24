-- Gift Items Table
CREATE TABLE IF NOT EXISTS gift_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🎁',
  image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gift_items ENABLE ROW LEVEL SECURITY;

-- Public read policy (for offer screen)
CREATE POLICY "Anyone can read visible gift items"
  ON gift_items FOR SELECT
  USING (is_visible = true);

-- Admin write policy
CREATE POLICY "Authenticated users can manage gift items"
  ON gift_items FOR ALL
  USING (auth.role() = 'authenticated');

-- Storage bucket for gift images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-images', 'gift-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: public read
CREATE POLICY "Public read gift images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gift-images');

-- Storage policy: authenticated upload
CREATE POLICY "Authenticated upload gift images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gift-images' AND auth.role() = 'authenticated');

-- Storage policy: authenticated delete
CREATE POLICY "Authenticated delete gift images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gift-images' AND auth.role() = 'authenticated');

-- Sample data
INSERT INTO gift_items (name, emoji, sort_order) VALUES
  ('স্মার্টফোন', '📱', 1),
  ('স্মার্টওয়াচ', '⌚', 2),
  ('ব্লুটুথ হেডফোন', '🎧', 3),
  ('ব্যাকপ্যাক', '🎒', 4),
  ('পাওয়ার ব্যাংক', '🔋', 5),
  ('পেন ড্রাইভ', '💾', 6),
  ('বই', '📚', 7),
  ('স্ক্র্যাচ কার্ড', '🎴', 8),
  ('মাউস', '🖱️', 9),
  ('কীবোর্ড', '⌨️', 10);
