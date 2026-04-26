-- ============================================================
-- Media Playlist Table — For Digital Signage Screen Play
-- ============================================================
CREATE TABLE IF NOT EXISTS media_playlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,                  -- 'image' | 'video'
  media_url TEXT NOT NULL,             -- URL for the media
  duration_seconds INTEGER DEFAULT 10, -- Used only for images
  play_with_sound BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE media_playlist ENABLE ROW LEVEL SECURITY;

-- Public can read active media
CREATE POLICY "Public read media"
  ON media_playlist FOR SELECT
  USING (is_active = true);

-- Only authenticated users can manage media
CREATE POLICY "Auth manage media"
  ON media_playlist FOR ALL
  USING (auth.role() = 'authenticated');

-- Create a storage bucket for media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'media' );

CREATE POLICY "Auth Upload"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'media' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Update"
    ON storage.objects FOR UPDATE
    USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Delete"
    ON storage.objects FOR DELETE
    USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );
