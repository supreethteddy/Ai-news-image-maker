-- Comprehensive Fix for Admin Access Issues
-- Run this in your Supabase SQL Editor

-- Step 1: Drop all existing admin policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all characters" ON characters;
DROP POLICY IF EXISTS "Admins can update all characters" ON characters;
DROP POLICY IF EXISTS "Admins can view all storyboards" ON storyboards;
DROP POLICY IF EXISTS "Admins can update all storyboards" ON storyboards;
DROP POLICY IF EXISTS "Admins can delete all storyboards" ON storyboards;
DROP POLICY IF EXISTS "Admins can view all styling templates" ON styling_templates;
DROP POLICY IF EXISTS "Admins can update all styling templates" ON styling_templates;

-- Step 2: Drop and recreate the is_admin function
DROP FUNCTION IF EXISTS is_admin();

-- Step 3: Create a robust is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has admin role
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
        AND (status IS NULL OR status = 'active')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;

-- Step 5: Create comprehensive admin policies
-- User profiles policies
CREATE POLICY "Admins can view all user profiles" ON user_profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all user profiles" ON user_profiles
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert user profiles" ON user_profiles
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete user profiles" ON user_profiles
    FOR DELETE USING (is_admin());

-- Characters policies
CREATE POLICY "Admins can view all characters" ON characters
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all characters" ON characters
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert characters" ON characters
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete characters" ON characters
    FOR DELETE USING (is_admin());

-- Storyboards policies (most important for your issue)
CREATE POLICY "Admins can view all storyboards" ON storyboards
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all storyboards" ON storyboards
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert storyboards" ON storyboards
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete storyboards" ON storyboards
    FOR DELETE USING (is_admin());

-- Styling templates policies
CREATE POLICY "Admins can view all styling templates" ON styling_templates
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all styling templates" ON styling_templates
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert styling templates" ON styling_templates
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete styling templates" ON styling_templates
    FOR DELETE USING (is_admin());

-- Step 6: Create or update admin user if needed
INSERT INTO user_profiles (id, email, name, role, status, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Placeholder UUID
    'admin@newsplaystudio.com',
    'Admin User',
    'admin',
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'admin',
    status = 'active',
    updated_at = NOW()
WHERE user_profiles.email = 'admin@newsplaystudio.com';

-- Step 7: Verify the setup
SELECT 'Admin policies created successfully' as status;

-- Test the is_admin function
SELECT 
    auth.uid() as current_user_id,
    is_admin() as is_admin_check,
    up.email,
    up.role,
    up.status
FROM user_profiles up
WHERE up.id = auth.uid();
