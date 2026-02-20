-- =====================================================
-- FIX SERIES HERO IMAGE URLS
-- =====================================================
-- Correct the hero_image_url for series with malformed URLs

UPDATE series
SET hero_image_url = 'https://video-stream-cdn.b-cdn.net/TMJ%20SERIES/08%20-%20Distribution%20is%20the%20Problem%20Series/Thumbnails%20Cover%20Art/16%3A9/Outer%20Cover%20Artwork.jpg'
WHERE title ILIKE '%distribution is the problem%';
