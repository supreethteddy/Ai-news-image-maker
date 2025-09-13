# Supabase Database Setup Instructions

## Step 1: Access Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/slxuebvxjqyxpnmhfzuu)
2. Click on **SQL Editor** in the left sidebar

## Step 2: Run Database Schema
Copy and paste the following SQL into the SQL Editor and click **Run**:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    reference_image_url TEXT,
    prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storyboards table
CREATE TABLE IF NOT EXISTS storyboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    original_text TEXT NOT NULL,
    storyboard_parts JSONB NOT NULL,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    style VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create styling_templates table
CREATE TABLE IF NOT EXISTS styling_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    visual_style VARCHAR(100) NOT NULL,
    color_theme VARCHAR(100) NOT NULL,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE styling_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for characters
CREATE POLICY "Users can view their own characters" ON characters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own characters" ON characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" ON characters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters" ON characters
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for storyboards
CREATE POLICY "Users can view their own storyboards" ON storyboards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storyboards" ON storyboards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storyboards" ON storyboards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storyboards" ON storyboards
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for styling_templates
CREATE POLICY "Users can view their own styling templates" ON styling_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own styling templates" ON styling_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own styling templates" ON styling_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own styling templates" ON styling_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_user_id ON storyboards(user_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_character_id ON storyboards(character_id);
CREATE INDEX IF NOT EXISTS idx_styling_templates_user_id ON styling_templates(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storyboards_updated_at BEFORE UPDATE ON storyboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_styling_templates_updated_at BEFORE UPDATE ON styling_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Verify Tables Created
After running the SQL, go to **Table Editor** in the left sidebar to verify that these tables were created:
- `characters`
- `storyboards` 
- `styling_templates`

## Step 4: Test the Integration
1. Start your backend server: `cd backend && node src/app.js`
2. Start your frontend: `npm run dev`
3. Try creating an account and logging in
4. Test creating characters and storyboards

## Troubleshooting
- If you get permission errors, make sure you're logged into the correct Supabase project
- If tables don't appear, refresh the Table Editor page
- Check the SQL Editor for any error messages
