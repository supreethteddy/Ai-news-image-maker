import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  console.log('SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test user_profiles table
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log('✅ Users found:', users.length);
      console.log('👥 User data:', users);
    }

    // Test storyboards table
    const { data: storyboards, error: storyboardsError } = await supabase
      .from('storyboards')
      .select('*')
      .limit(5);
    
    if (storyboardsError) {
      console.error('❌ Error fetching storyboards:', storyboardsError);
    } else {
      console.log('✅ Storyboards found:', storyboards.length);
      console.log('📚 Storyboard data:', storyboards);
    }

    // Test credit_transactions table
    const { data: transactions, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('*')
      .limit(5);
    
    if (transactionsError) {
      console.error('❌ Error fetching transactions:', transactionsError);
    } else {
      console.log('✅ Transactions found:', transactions.length);
      console.log('💳 Transaction data:', transactions);
    }

    // Test foreign key relationships
    const { data: usersWithStoryboards, error: relationshipError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        storyboards:storyboards(count),
        credit_transactions:credit_transactions(count)
      `)
      .limit(3);
    
    if (relationshipError) {
      console.error('❌ Error testing relationships:', relationshipError);
    } else {
      console.log('✅ Relationships working:', usersWithStoryboards.length);
      console.log('🔗 User relationships:', usersWithStoryboards);
    }

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
}

testDatabaseConnection();
