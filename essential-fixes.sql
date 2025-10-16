-- Essential fixes for missing columns

-- Add isDefault column to styling_templates table
ALTER TABLE styling_templates 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add scene_count column to storyboards table  
ALTER TABLE storyboards 
ADD COLUMN IF NOT EXISTS scene_count INTEGER DEFAULT 6;
