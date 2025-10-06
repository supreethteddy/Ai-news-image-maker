-- Admin RLS Policies for AI News Image Maker
-- These policies allow admin users to access all data

-- First, let's create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for user_profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all user profiles" ON user_profiles
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all user profiles" ON user_profiles
    FOR DELETE USING (is_admin());

-- Admin policies for characters
CREATE POLICY "Admins can view all characters" ON characters
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all characters" ON characters
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all characters" ON characters
    FOR DELETE USING (is_admin());

-- Admin policies for storyboards
CREATE POLICY "Admins can view all storyboards" ON storyboards
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all storyboards" ON storyboards
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all storyboards" ON storyboards
    FOR DELETE USING (is_admin());

-- Admin policies for styling_templates
CREATE POLICY "Admins can view all styling templates" ON styling_templates
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all styling templates" ON styling_templates
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all styling templates" ON styling_templates
    FOR DELETE USING (is_admin());

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
