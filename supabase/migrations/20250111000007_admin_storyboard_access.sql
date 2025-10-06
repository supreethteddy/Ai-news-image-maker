-- Admin RLS Policies for Storyboard Access
-- This migration adds comprehensive admin access policies

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

-- Admin policies for user_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Admins can view all user profiles'
    ) THEN
        CREATE POLICY "Admins can view all user profiles" ON user_profiles
            FOR SELECT USING (is_admin());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Admins can update all user profiles'
    ) THEN
        CREATE POLICY "Admins can update all user profiles" ON user_profiles
            FOR UPDATE USING (is_admin());
    END IF;
END $$;

-- Admin policies for characters
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'characters' 
        AND policyname = 'Admins can view all characters'
    ) THEN
        CREATE POLICY "Admins can view all characters" ON characters
            FOR SELECT USING (is_admin());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'characters' 
        AND policyname = 'Admins can update all characters'
    ) THEN
        CREATE POLICY "Admins can update all characters" ON characters
            FOR UPDATE USING (is_admin());
    END IF;
END $$;

-- Admin policies for storyboards
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storyboards' 
        AND policyname = 'Admins can view all storyboards'
    ) THEN
        CREATE POLICY "Admins can view all storyboards" ON storyboards
            FOR SELECT USING (is_admin());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storyboards' 
        AND policyname = 'Admins can update all storyboards'
    ) THEN
        CREATE POLICY "Admins can update all storyboards" ON storyboards
            FOR UPDATE USING (is_admin());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storyboards' 
        AND policyname = 'Admins can delete all storyboards'
    ) THEN
        CREATE POLICY "Admins can delete all storyboards" ON storyboards
            FOR DELETE USING (is_admin());
    END IF;
END $$;

-- Admin policies for styling_templates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'styling_templates' 
        AND policyname = 'Admins can view all styling templates'
    ) THEN
        CREATE POLICY "Admins can view all styling templates" ON styling_templates
            FOR SELECT USING (is_admin());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'styling_templates' 
        AND policyname = 'Admins can update all styling templates'
    ) THEN
        CREATE POLICY "Admins can update all styling templates" ON styling_templates
            FOR UPDATE USING (is_admin());
    END IF;
END $$;
