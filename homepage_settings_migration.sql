-- ============================================================
-- Homepage Settings Migration
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS homepage_settings (
  id              int PRIMARY KEY DEFAULT 1,

  -- Ticker / News Banner
  ticker_enabled  boolean  DEFAULT true,
  ticker_text     text     DEFAULT '🎉 Now Offering Research Paper Writing + Thesis Help — Get Expert Guidance Today! • Assignment Help & Handmade Projects Available • Website & App Development Starting ₹5,000',
  ticker_color    text     DEFAULT '#FF6B35',
  ticker_bg       text     DEFAULT '#0d0d0d',

  -- Hero Section Stats (4 cards) — stored as JSONB array
  hero_stats      jsonb    DEFAULT '[
    {"value": "500+", "label": "Projects Completed"},
    {"value": "2000+", "label": "Happy Clients"},
    {"value": "98%", "label": "Satisfaction Rate"},
    {"value": "5★", "label": "Average Rating"}
  ]'::jsonb,

  -- Numbers That Speak Section (4 animated counter cards)
  stats_section   jsonb    DEFAULT '[
    {"icon": "🏆", "value": 500,  "suffix": "+", "label": "Projects Completed"},
    {"icon": "⭐", "value": 98,   "suffix": "%", "label": "Client Satisfaction"},
    {"icon": "👥", "value": 2000, "suffix": "+", "label": "Happy Clients"},
    {"icon": "🎓", "value": 50,   "suffix": "+", "label": "Service Categories"}
  ]'::jsonb,

  -- Homepage Service Tiles (8 combined tiles)
  service_tiles   jsonb    DEFAULT '[
    {"title": "Website & App Development", "color": "#0099ff",  "icon": "💻", "audience": ["all", "students", "professionals", "businesses"]},
    {"title": "Research Paper & Thesis Writing", "color": "#22c55e", "icon": "📄", "audience": ["all", "students", "professionals"]},
    {"title": "Assignment Help & Handmade Projects", "color": "#f59e0b", "icon": "✍️", "audience": ["all", "students"]},
    {"title": "SEO & Digital Marketing", "color": "#ff7a3d", "icon": "📣", "audience": ["all", "businesses", "professionals"]},
    {"title": "3D Design & Video Editing", "color": "#d44df0", "icon": "🎨", "audience": ["all", "businesses", "professionals"]},
    {"title": "API Integration & Automation", "color": "#6a4cf5", "icon": "⚙️", "audience": ["all", "businesses", "professionals"]},
    {"title": "Government & Business Solutions", "color": "#FF6B35", "icon": "🏛️", "audience": ["all", "businesses", "government"]},
    {"title": "Study Abroad & Visa Consulting", "color": "#06b6d4", "icon": "🌍", "audience": ["all", "students", "professionals"]}
  ]'::jsonb,

  updated_at      timestamptz DEFAULT now(),
  updated_by      int         REFERENCES users(id) ON DELETE SET NULL
);

-- Only one row ever exists — prevent multiple rows
CREATE UNIQUE INDEX IF NOT EXISTS homepage_settings_singleton ON homepage_settings(id);

-- Insert default row if not exists
INSERT INTO homepage_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS: read is public; write is super_admin only
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_homepage_settings" ON homepage_settings;
CREATE POLICY "public_read_homepage_settings"
  ON homepage_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "super_admin_write_homepage_settings" ON homepage_settings;
CREATE POLICY "super_admin_write_homepage_settings"
  ON homepage_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.current_user_id', true))::int
        AND users.role = 'super_admin'
    )
  );
