-- Run this in Supabase to fix slugs (remove ID suffixes)

-- 1. Update existing slugs to remove ID suffix
UPDATE storyboards 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

-- 2. Verify the update
SELECT id, title, slug FROM storyboards ORDER BY created_at DESC;

