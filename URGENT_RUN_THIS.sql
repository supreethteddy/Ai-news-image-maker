-- ⚠️ URGENT: Run this in Supabase SQL Editor NOW
-- This fixes the issue where new users get 10 credits instead of 0

-- Step 1: Change DEFAULT value from 10 to 0
ALTER TABLE user_profiles 
ALTER COLUMN credits SET DEFAULT 0;

-- Step 2: Check current users and their credits
SELECT 
    id, 
    name, 
    email, 
    credits, 
    created_at,
    (SELECT COUNT(*) FROM storyboards WHERE user_id = user_profiles.id) as story_count
FROM user_profiles 
ORDER BY created_at DESC;

-- Step 3: OPTIONAL - Reset new test users to 0 credits
-- Only run this if you want to reset recent test accounts
-- Comment out if you have real users with purchased credits

/*
UPDATE user_profiles 
SET credits = 0 
WHERE credits = 10 
  AND created_at > NOW() - INTERVAL '1 day'  -- Only users created in last 24 hours
  AND NOT EXISTS (
    -- Don't reset if user purchased credits
    SELECT 1 FROM credit_transactions 
    WHERE credit_transactions.user_id = user_profiles.id 
      AND transaction_type = 'credit'
      AND description LIKE '%purchase%'
  );
*/

-- Step 4: Verify the default is now 0
SELECT column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name = 'credits';

-- Expected result: 0 (not 10)



