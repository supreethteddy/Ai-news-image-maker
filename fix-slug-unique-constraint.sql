-- Fix the slug issue by removing UNIQUE constraint and adding unique suffixes

-- 1. Drop the UNIQUE constraint first
ALTER TABLE storyboards DROP CONSTRAINT IF EXISTS storyboards_slug_key;

-- 2. Now update slugs with a counter for duplicates
WITH ranked_storyboards AS (
  SELECT 
    id,
    title,
    ROW_NUMBER() OVER (PARTITION BY LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) ORDER BY created_at) as rn
  FROM storyboards
)
UPDATE storyboards s
SET slug = CASE 
  WHEN r.rn = 1 THEN 
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(s.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
  ELSE 
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(s.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || r.rn
END
FROM ranked_storyboards r
WHERE s.id = r.id;

-- 3. Verify the update
SELECT id, title, slug, created_at FROM storyboards ORDER BY created_at DESC;

