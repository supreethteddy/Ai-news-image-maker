-- Fix missing database columns causing 500 errors

-- 1. Add isDefault column to styling_templates table
ALTER TABLE styling_templates 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- 2. Add scene_count column to storyboards table  
ALTER TABLE storyboards 
ADD COLUMN IF NOT EXISTS scene_count INTEGER DEFAULT 6;

-- 3. Add slug column to storyboards table
ALTER TABLE storyboards 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_styling_templates_is_default ON styling_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_storyboards_scene_count ON storyboards(scene_count);
CREATE INDEX IF NOT EXISTS idx_storyboards_slug ON storyboards(slug);

-- 5. Update existing records
UPDATE storyboards 
SET scene_count = 6 
WHERE scene_count IS NULL;

UPDATE storyboards 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- 6. Verify the changes
SELECT 'styling_templates columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'styling_templates' 
ORDER BY ordinal_position;

SELECT 'storyboards columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'storyboards' 
ORDER BY ordinal_position;
