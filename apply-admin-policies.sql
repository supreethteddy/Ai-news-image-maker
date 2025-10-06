-- Apply Admin RLS Policies
-- Run this in your Supabase SQL Editor

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Drop existing admin policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all characters" ON characters;
DROP POLICY IF EXISTS "Admins can update all characters" ON characters;
DROP POLICY IF EXISTS "Admins can view all storyboards" ON storyboards;
DROP POLICY IF EXISTS "Admins can update all storyboards" ON storyboards;
DROP POLICY IF EXISTS "Admins can delete all storyboards" ON storyboards;
DROP POLICY IF EXISTS "Admins can view all styling templates" ON styling_templates;
DROP POLICY IF EXISTS "Admins can update all styling templates" ON styling_templates;

-- Create admin policies for user_profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all user profiles" ON user_profiles
    FOR UPDATE USING (is_admin());

-- Create admin policies for characters
CREATE POLICY "Admins can view all characters" ON characters
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all characters" ON characters
    FOR UPDATE USING (is_admin());

-- Create admin policies for storyboards
CREATE POLICY "Admins can view all storyboards" ON storyboards
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all storyboards" ON storyboards
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all storyboards" ON storyboards
    FOR DELETE USING (is_admin());

-- Create admin policies for styling_templates
CREATE POLICY "Admins can view all styling templates" ON styling_templates
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all styling templates" ON styling_templates
    FOR UPDATE USING (is_admin());

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'characters', 'storyboards', 'styling_templates')
AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
