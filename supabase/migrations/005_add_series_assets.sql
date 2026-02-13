-- =====================================================
-- ADD SERIES ASSET COLUMNS
-- =====================================================
-- Add missing asset columns to series table for featured banners and hero images

-- Add columns if they don't exist
ALTER TABLE series ADD COLUMN IF NOT EXISTS cover_art_url TEXT DEFAULT NULL;
ALTER TABLE series ADD COLUMN IF NOT EXISTS backdrop_url TEXT DEFAULT NULL;
ALTER TABLE series ADD COLUMN IF NOT EXISTS trailer_url TEXT DEFAULT NULL;
ALTER TABLE series ADD COLUMN IF NOT EXISTS hero_image_url TEXT DEFAULT NULL;
ALTER TABLE series ADD COLUMN IF NOT EXISTS top_10_thumbnail_url TEXT DEFAULT NULL;

-- Create index for featured series queries
CREATE INDEX IF NOT EXISTS idx_series_featured ON series(featured) WHERE featured = true;

-- Create index for top_10_rank queries
CREATE INDEX IF NOT EXISTS idx_series_top_10 ON series(top_10_rank) WHERE top_10_rank IS NOT NULL;
