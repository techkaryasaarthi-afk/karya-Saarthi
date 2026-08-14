-- ============================================================
-- Saarthi Xpress Services Table
-- Run this in Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS saarthi_xpress_services (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE,
  category      TEXT DEFAULT 'express',
  short_description TEXT,
  delivery_hours INTEGER DEFAULT 24,  -- 1 = 1 Hour, 4 = 4 Hours, 24 = 24 Hours, 0 = Expert
  price_min     NUMERIC,
  price_max     NUMERIC,
  featured_image TEXT,
  rating        NUMERIC DEFAULT 0,
  total_orders  INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  tags          TEXT[] DEFAULT '{}',
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_saarthi_xpress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saarthi_xpress_updated_at_trigger ON saarthi_xpress_services;
CREATE TRIGGER saarthi_xpress_updated_at_trigger
  BEFORE UPDATE ON saarthi_xpress_services
  FOR EACH ROW
  EXECUTE FUNCTION update_saarthi_xpress_updated_at();

-- Enable RLS
ALTER TABLE saarthi_xpress_services ENABLE ROW LEVEL SECURITY;

-- Public read for active services
CREATE POLICY "Public can read active saarthi xpress services"
  ON saarthi_xpress_services FOR SELECT
  USING (is_active = true);

-- Seed with default Saarthi Xpress services
INSERT INTO saarthi_xpress_services (title, slug, category, short_description, delivery_hours, price_min, price_max, is_featured, tags, sort_order)
VALUES
  ('PPT Redesign', 'ppt-redesign', 'design', 'Make your presentation professional and impactful.', 4, 399, 999, true, ARRAY['ppt', 'presentation', 'design'], 1),
  ('Reel / Video Editing', 'reel-video-editing', 'video', 'Create engaging reels & videos for social media.', 4, 299, 799, true, ARRAY['reel', 'video', 'editing', 'social'], 2),
  ('Resume / CV Design', 'resume-cv-design', 'design', 'Get noticed with a professional CV.', 4, 399, 999, true, ARRAY['resume', 'cv', 'design', 'career'], 3),
  ('Plagiarism Report', 'plagiarism-report', 'academic', 'Check similarity with detailed report (Turnitin).', 4, 299, 599, false, ARRAY['plagiarism', 'turnitin', 'academic'], 4),
  ('Research Paper Formatting', 'research-paper-formatting', 'academic', 'Format with proper references and citations.', 24, 499, 1299, false, ARRAY['research', 'formatting', 'apa', 'academic'], 5),
  ('Social Media Post Pack', 'social-media-post-pack', 'marketing', 'Professional posts for your brand.', 24, 599, 1499, false, ARRAY['social', 'instagram', 'marketing', 'posts'], 6)
ON CONFLICT (slug) DO NOTHING;
