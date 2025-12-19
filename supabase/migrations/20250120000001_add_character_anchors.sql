-- Add character_anchors column to storyboards table for storing character reference images
ALTER TABLE storyboards 
ADD COLUMN IF NOT EXISTS character_anchors JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN storyboards.character_anchors IS 'Array of character anchor images used for maintaining consistency during image regeneration. Each entry contains: name, base64, url, and description.';

