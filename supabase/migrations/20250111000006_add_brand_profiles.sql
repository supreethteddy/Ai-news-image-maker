-- Add brand profiles table for users to save and reuse brand configurations
CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    core_colors JSONB DEFAULT '[]',
    brand_personality TEXT,
    visual_style_preference VARCHAR(100),
    mood_preference VARCHAR(100),
    target_audience TEXT,
    design_language_notes TEXT,
    reference_images JSONB DEFAULT '[]',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brand_profiles
CREATE POLICY "Users can view their own brand profiles" ON brand_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand profiles" ON brand_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand profiles" ON brand_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand profiles" ON brand_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_is_default ON brand_profiles(user_id, is_default);

-- Create updated_at trigger for brand_profiles
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for brand_profiles
ALTER TABLE brand_profiles 
ADD CONSTRAINT fk_brand_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
