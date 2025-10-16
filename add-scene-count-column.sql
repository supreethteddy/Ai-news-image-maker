-- Critical Database Fixes - Scene Count & Styling Templates
-- This migration adds missing columns that are causing 500 errors

-- 1. Add scene_count column to storyboards table
ALTER TABLE storyboards 
ADD COLUMN IF NOT EXISTS scene_count INTEGER DEFAULT 6;

-- Add a check constraint to ensure scene_count is between 3 and 10
ALTER TABLE storyboards 
ADD CONSTRAINT check_scene_count_range 
CHECK (scene_count >= 3 AND scene_count <= 10);

-- Update existing storyboards to have default scene_count
UPDATE storyboards 
SET scene_count = 6 
WHERE scene_count IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_storyboards_scene_count ON storyboards(scene_count);

-- 2. Add isDefault column to styling_templates table (to fix template selection error)
ALTER TABLE styling_templates 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_styling_templates_is_default ON styling_templates(is_default);

-- 3. Add slug column to storyboards table for SEO-friendly URLs
ALTER TABLE storyboards 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_storyboards_slug ON storyboards(slug);

-- Generate slugs for existing storyboards (clean, no ID suffix)
UPDATE storyboards 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

