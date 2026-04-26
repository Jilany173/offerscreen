-- Fix Media Playlist Table Policies
-- Run this if deletion or upload is not working

-- 1. Enable RLS
ALTER TABLE public.media_playlist ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Public read media" ON public.media_playlist;
DROP POLICY IF EXISTS "Auth manage media" ON public.media_playlist;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.media_playlist;

-- 3. Create permissive policies (Allows testing without login)
-- Allow everyone to read
CREATE POLICY "Public read access" ON public.media_playlist FOR SELECT USING (true);

-- Allow everyone to manage (Insert, Update, Delete)
CREATE POLICY "Public manage access" ON public.media_playlist FOR ALL USING (true) WITH CHECK (true);
