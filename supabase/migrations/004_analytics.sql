-- =====================================================
-- ANALYTICS TABLES
-- =====================================================
-- Run this in Supabase SQL Editor to add analytics tracking

-- Video Views (detailed view tracking)
CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  watched_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_video_views_video ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user ON video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_created ON video_views(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(created_at);

-- Enable RLS
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_views
DROP POLICY IF EXISTS "Anyone can insert video views" ON video_views;
CREATE POLICY "Anyone can insert video views"
  ON video_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all video views" ON video_views;
CREATE POLICY "Admins can view all video views"
  ON video_views FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can view own video views" ON video_views;
CREATE POLICY "Users can view own video views"
  ON video_views FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function to get daily signups for the last 30 days
CREATE OR REPLACE FUNCTION get_daily_signups(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(*)::BIGINT as count
  FROM profiles
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily views for the last 30 days
CREATE OR REPLACE FUNCTION get_daily_views(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(*)::BIGINT as count
  FROM video_views
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top videos by views
CREATE OR REPLACE FUNCTION get_top_videos(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  video_id UUID,
  title TEXT,
  thumbnail_url TEXT,
  view_count BIGINT,
  unique_viewers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id as video_id,
    v.title,
    v.thumbnail_url,
    COUNT(vv.id)::BIGINT as view_count,
    COUNT(DISTINCT vv.user_id)::BIGINT as unique_viewers
  FROM videos v
  LEFT JOIN video_views vv ON v.id = vv.video_id
  WHERE v.is_published = true
  GROUP BY v.id, v.title, v.thumbnail_url
  ORDER BY view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_daily_signups TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_views TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_videos TO authenticated;
