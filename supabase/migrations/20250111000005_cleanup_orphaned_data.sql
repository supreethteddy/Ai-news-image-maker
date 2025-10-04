-- Clean up orphaned data before adding foreign keys
-- This migration removes orphaned records that would violate foreign key constraints

-- First, let's see what orphaned data exists and clean it up
-- Remove storyboards that reference non-existent users
DELETE FROM storyboards 
WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Remove credit_transactions that reference non-existent users  
DELETE FROM credit_transactions 
WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Remove credit_purchases that reference non-existent users
DELETE FROM credit_purchases 
WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Remove admin_actions that reference non-existent users
DELETE FROM admin_actions 
WHERE admin_id NOT IN (SELECT id FROM user_profiles) 
   OR target_user_id NOT IN (SELECT id FROM user_profiles);

-- Now add the foreign key constraints
ALTER TABLE credit_transactions 
ADD CONSTRAINT fk_credit_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE credit_purchases 
ADD CONSTRAINT fk_credit_purchases_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE credit_purchases 
ADD CONSTRAINT fk_credit_purchases_package_id 
FOREIGN KEY (package_id) REFERENCES credit_packages(id) ON DELETE RESTRICT;

ALTER TABLE storyboards 
ADD CONSTRAINT fk_storyboards_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE admin_actions 
ADD CONSTRAINT fk_admin_actions_admin_id 
FOREIGN KEY (admin_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

ALTER TABLE admin_actions 
ADD CONSTRAINT fk_admin_actions_target_user_id 
FOREIGN KEY (target_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_created_at ON credit_purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_storyboards_user_id ON storyboards(user_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_created_at ON storyboards(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own credit transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can view their own credit purchases" ON credit_purchases;
DROP POLICY IF EXISTS "Users can view their own storyboards" ON storyboards;
DROP POLICY IF EXISTS "Admins can view all credit transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Admins can view all credit purchases" ON credit_purchases;
DROP POLICY IF EXISTS "Admins can view all storyboards" ON storyboards;

-- Recreate RLS policies
CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credit purchases" ON credit_purchases  
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own storyboards" ON storyboards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credit transactions" ON credit_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all credit purchases" ON credit_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all storyboards" ON storyboards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Enable RLS on all tables
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
