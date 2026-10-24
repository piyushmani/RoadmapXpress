-- ==============================================================================
-- RoadmapXpress - Supabase Production Schema & Security Policies
-- ==============================================================================

-- 1. Create Roadmaps Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  tag TEXT DEFAULT 'latest',
  is_latest BOOLEAN NOT NULL DEFAULT true,
  json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_roadmaps_slug_is_latest ON public.roadmaps (slug, is_latest);
CREATE INDEX IF NOT EXISTS idx_roadmaps_slug_version ON public.roadmaps (slug, version DESC);
CREATE INDEX IF NOT EXISTS idx_roadmaps_is_latest ON public.roadmaps (is_latest);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Anyone can read published roadmaps
CREATE POLICY "Public roadmaps are viewable by everyone"
  ON public.roadmaps
  FOR SELECT
  USING (true);

-- 5. RLS Policy: Only authenticated admins or service_role can mutate roadmaps
CREATE POLICY "Admins can insert roadmaps"
  ON public.roadmaps
  FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
    OR (auth.role() = 'service_role')
  );

CREATE POLICY "Admins can update roadmaps"
  ON public.roadmaps
  FOR UPDATE
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
    OR (auth.role() = 'service_role')
  );

CREATE POLICY "Admins can delete roadmaps"
  ON public.roadmaps
  FOR DELETE
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
    OR (auth.role() = 'service_role')
  );
