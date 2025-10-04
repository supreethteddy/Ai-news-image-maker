-- Add credits system to the database (standalone migration)

-- Add credits column to user_profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'credits'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN credits INTEGER DEFAULT 10 NOT NULL;
    END IF;
END $$;

-- Create credit_transactions table to track credit usage
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'debit', 'credit', 'bonus', 'refund'
    amount INTEGER NOT NULL, -- positive for credits added, negative for credits used
    description TEXT,
    reference_id UUID, -- can reference storyboard_id or other entities
    reference_type VARCHAR(50), -- 'storyboard', 'purchase', 'bonus', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL -- for admin transactions
);

-- Enable RLS for credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credit_transactions (with IF NOT EXISTS equivalent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_transactions' 
        AND policyname = 'Users can view their own credit transactions'
    ) THEN
        CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_transactions' 
        AND policyname = 'System can insert credit transactions'
    ) THEN
        CREATE POLICY "System can insert credit transactions" ON credit_transactions
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_transactions' 
        AND policyname = 'Admins can view all credit transactions'
    ) THEN
        CREATE POLICY "Admins can view all credit transactions" ON credit_transactions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_credits ON user_profiles(credits);

-- Create trigger for updated_at on credit_transactions (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_credit_transactions_updated_at'
    ) THEN
        CREATE TRIGGER update_credit_transactions_updated_at BEFORE UPDATE ON credit_transactions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Function to safely update user credits
CREATE OR REPLACE FUNCTION update_user_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
    new_credits INTEGER;
BEGIN
    -- Get current credits with row lock
    SELECT credits INTO current_credits 
    FROM user_profiles 
    WHERE id = p_user_id 
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
    
    -- Calculate new credits
    new_credits := current_credits + p_amount;
    
    -- Prevent negative credits for debit transactions
    IF p_transaction_type = 'debit' AND new_credits < 0 THEN
        RAISE EXCEPTION 'Insufficient credits. Current: %, Required: %', current_credits, ABS(p_amount);
    END IF;
    
    -- Update user credits
    UPDATE user_profiles 
    SET credits = new_credits 
    WHERE id = p_user_id;
    
    -- Insert transaction record
    INSERT INTO credit_transactions (
        user_id, 
        transaction_type, 
        amount, 
        description, 
        reference_id, 
        reference_type,
        created_by
    ) VALUES (
        p_user_id, 
        p_transaction_type, 
        p_amount, 
        p_description, 
        p_reference_id, 
        p_reference_type,
        p_created_by
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has enough credits
CREATE OR REPLACE FUNCTION check_user_credits(
    p_user_id UUID,
    p_required_credits INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    SELECT credits INTO current_credits 
    FROM user_profiles 
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN current_credits >= p_required_credits;
END;
$$ LANGUAGE plpgsql;

-- Update existing users to have 10 credits (for users who don't have credits set)
UPDATE user_profiles 
SET credits = 10 
WHERE credits IS NULL;

-- Add constraint to ensure credits cannot be negative (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_credits_non_negative'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT check_credits_non_negative 
        CHECK (credits >= 0);
    END IF;
END $$;
