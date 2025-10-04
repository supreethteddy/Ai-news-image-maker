-- Add credit recharge system

-- Create credit_packages table for different recharge options
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price_usd, bonus_credits, description) VALUES
('Starter Pack', 10, 4.99, 0, 'Perfect for trying out the platform'),
('Creator Pack', 25, 9.99, 5, 'Great for regular users - includes 5 bonus credits!'),
('Pro Pack', 50, 19.99, 15, 'Best value for power users - includes 15 bonus credits!'),
('Business Pack', 100, 34.99, 25, 'Perfect for teams and businesses - includes 25 bonus credits!'),
('Enterprise Pack', 250, 79.99, 75, 'Maximum value for heavy usage - includes 75 bonus credits!')
ON CONFLICT DO NOTHING;

-- Create credit_purchases table to track recharge transactions
CREATE TABLE IF NOT EXISTS credit_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    package_id UUID REFERENCES credit_packages(id) ON DELETE SET NULL,
    credits_purchased INTEGER NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    total_credits INTEGER NOT NULL, -- credits_purchased + bonus_credits
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- 'stripe', 'paypal', 'demo', etc.
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_id VARCHAR(255), -- External payment processor ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for new tables
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit_packages (public read access)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_packages' 
        AND policyname = 'Anyone can view active credit packages'
    ) THEN
        CREATE POLICY "Anyone can view active credit packages" ON credit_packages
            FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- RLS policies for credit_purchases
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_purchases' 
        AND policyname = 'Users can view their own purchases'
    ) THEN
        CREATE POLICY "Users can view their own purchases" ON credit_purchases
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_purchases' 
        AND policyname = 'System can insert purchases'
    ) THEN
        CREATE POLICY "System can insert purchases" ON credit_purchases
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_purchases' 
        AND policyname = 'Admins can view all purchases'
    ) THEN
        CREATE POLICY "Admins can view all purchases" ON credit_purchases
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_created_at ON credit_purchases(created_at);

-- Create triggers for updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_credit_packages_updated_at'
    ) THEN
        CREATE TRIGGER update_credit_packages_updated_at BEFORE UPDATE ON credit_packages
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Function to process credit purchase
CREATE OR REPLACE FUNCTION process_credit_purchase(
    p_user_id UUID,
    p_package_id UUID,
    p_payment_method VARCHAR(50) DEFAULT 'demo',
    p_payment_id VARCHAR(255) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_package credit_packages%ROWTYPE;
    v_purchase_id UUID;
    v_total_credits INTEGER;
BEGIN
    -- Get package details
    SELECT * INTO v_package FROM credit_packages WHERE id = p_package_id AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Credit package not found or inactive: %', p_package_id;
    END IF;
    
    -- Calculate total credits (base + bonus)
    v_total_credits := v_package.credits + v_package.bonus_credits;
    
    -- Create purchase record
    INSERT INTO credit_purchases (
        user_id,
        package_id,
        credits_purchased,
        bonus_credits,
        total_credits,
        amount_paid,
        payment_method,
        payment_status,
        payment_id,
        completed_at
    ) VALUES (
        p_user_id,
        p_package_id,
        v_package.credits,
        v_package.bonus_credits,
        v_total_credits,
        v_package.price_usd,
        p_payment_method,
        'completed', -- For demo payments, mark as completed immediately
        p_payment_id,
        NOW()
    ) RETURNING id INTO v_purchase_id;
    
    -- Add credits to user account
    PERFORM update_user_credits(
        p_user_id,
        v_total_credits,
        'credit',
        format('Credit recharge: %s (%s credits + %s bonus)', v_package.name, v_package.credits, v_package.bonus_credits),
        v_purchase_id,
        'purchase'
    );
    
    RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's low credit warning threshold
CREATE OR REPLACE FUNCTION should_show_credit_warning(
    p_user_id UUID,
    p_warning_threshold INTEGER DEFAULT 3
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
    
    RETURN current_credits <= p_warning_threshold;
END;
$$ LANGUAGE plpgsql;

-- Add user preferences for credit notifications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'credit_warning_threshold'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN credit_warning_threshold INTEGER DEFAULT 3;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'email_notifications'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN email_notifications BOOLEAN DEFAULT true;
    END IF;
END $$;
