-- Add admin user management fields to user_profiles table

-- Add status and flagging columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'status_reason'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN status_reason TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'is_flagged'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN is_flagged BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'flag_reason'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN flag_reason TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'flagged_by'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'flagged_at'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN flagged_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_flagged ON user_profiles(is_flagged);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login);

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'flag_user', 'disable_user', 'add_credits', etc.
    action_details JSONB,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin_actions
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_actions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_actions' 
        AND policyname = 'Admins can view admin actions'
    ) THEN
        CREATE POLICY "Admins can view admin actions" ON admin_actions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_actions' 
        AND policyname = 'Admins can insert admin actions'
    ) THEN
        CREATE POLICY "Admins can insert admin actions" ON admin_actions
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Create indexes for admin_actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_target_user_id UUID,
    p_action_type VARCHAR(100),
    p_action_details JSONB DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_action_id UUID;
BEGIN
    INSERT INTO admin_actions (
        admin_id,
        target_user_id,
        action_type,
        action_details,
        reason
    ) VALUES (
        p_admin_id,
        p_target_user_id,
        p_action_type,
        p_action_details,
        p_reason
    ) RETURNING id INTO v_action_id;
    
    RETURN v_action_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing users to have active status
UPDATE user_profiles 
SET status = 'active' 
WHERE status IS NULL;
