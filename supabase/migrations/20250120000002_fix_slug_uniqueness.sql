-- Fix slug uniqueness issue

-- Step 1: Find and delete duplicate slugs, keeping only the most recent one
DELETE FROM storyboards a
USING storyboards b
WHERE a.slug = b.slug 
  AND a.slug IS NOT NULL
  AND a.created_at < b.created_at;

-- Step 2: Add unique constraint to slug column (if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storyboards_slug_unique'
    ) THEN
        ALTER TABLE storyboards 
        ADD CONSTRAINT storyboards_slug_unique UNIQUE (slug);
    END IF;
END $$;

-- Step 3: Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_storyboards_slug ON storyboards(slug);

-- Add comment
COMMENT ON COLUMN storyboards.slug IS 'Unique URL-friendly identifier for the storyboard. Used for public sharing.';
