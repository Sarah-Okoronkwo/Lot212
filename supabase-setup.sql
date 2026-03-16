-- ============================================================
-- NewsStories — Supabase Database Setup
-- Run this SQL in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/<your-project>/sql/new
-- ============================================================

-- 1. Create the stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url   TEXT NOT NULL,
  media_type  TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'breaking',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL GENERATED ALWAYS AS (created_at + INTERVAL '24 hours') STORED,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Index for fast active story queries
CREATE INDEX IF NOT EXISTS idx_stories_active_expires
  ON public.stories (is_active, expires_at DESC)
  WHERE is_active = TRUE;

-- 3. Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Public can read active, non-expired stories
CREATE POLICY "Public can read active stories"
  ON public.stories
  FOR SELECT
  USING (
    is_active = TRUE
    AND expires_at > NOW()
  );

-- 5. RLS: Authenticated users (admins) can do everything
CREATE POLICY "Authenticated users have full access"
  ON public.stories
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- Storage: Create the 'stories' bucket
-- ============================================================
-- Option A: Run in SQL (requires storage schema access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  TRUE,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view files
CREATE POLICY "Public read storage"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'stories');

-- Storage RLS: Authenticated users can upload
CREATE POLICY "Authenticated upload storage"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'stories');

-- Storage RLS: Authenticated users can delete
CREATE POLICY "Authenticated delete storage"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'stories');

-- ============================================================
-- Optional: Seed some sample data to test the viewer
-- (Replace with real image URLs hosted anywhere publicly)
-- ============================================================
/*
INSERT INTO public.stories (media_url, media_type, caption, category) VALUES
(
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
  'image',
  'World leaders gather in Geneva for emergency climate summit',
  'world'
),
(
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  'image',
  'Tech giant unveils breakthrough AI chip running 10x faster than predecessors',
  'technology'
),
(
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  'image',
  'Markets surge after surprise rate hold — Dow closes at record high',
  'business'
);
*/
