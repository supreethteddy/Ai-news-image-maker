-- Troubleshoot Admin Access Issues
-- Run this in your Supabase SQL Editor to diagnose the problem

-- 1. Check if admin user exists and has correct role
SELECT 
    id, 
    email, 
    name, 
    role, 
    status,
    created_at
FROM user_profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 2. Check current user's role (run this while logged in as admin)
SELECT 
    auth.uid() as current_user_id,
    up.email,
    up.name,
    up.role,
    up.status
FROM user_profiles up
WHERE up.id = auth.uid();

-- 3. Check if is_admin() function exists and works
SELECT is_admin() as is_current_user_admin;

-- 4. Check existing RLS policies for storyboards
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'storyboards'
ORDER BY policyname;

-- 5. Test direct access to storyboards (this should work for admin)
SELECT 
    id, 
    title, 
    user_id, 
    created_at,
    status
FROM storyboards 
LIMIT 5;

-- 6. Check if there are any conflicting policies
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'characters', 'storyboards', 'styling_templates')
AND (policyname LIKE '%Admin%' OR policyname LIKE '%admin%')
ORDER BY tablename, policyname;
