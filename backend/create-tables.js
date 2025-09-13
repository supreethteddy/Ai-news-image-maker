import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTables() {
  console.log('🚀 Creating database tables...');
  
  try {
    // Test connection first
    console.log('Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('Connection test error:', testError.message);
    } else {
      console.log('✅ Supabase connection successful!');
    }
    
    // Try to create tables using direct SQL execution
    console.log('\n📋 Creating tables...');
    
    // Create user_profiles table
    console.log('Creating user_profiles table...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profileError && profileError.code === 'PGRST205') {
      console.log('❌ user_profiles table does not exist - need to create it');
    } else if (profileError) {
      console.log('❌ user_profiles error:', profileError.message);
    } else {
      console.log('✅ user_profiles table already exists');
    }
    
    // Create characters table
    console.log('Creating characters table...');
    const { error: charError } = await supabase
      .from('characters')
      .select('*')
      .limit(1);
    
    if (charError && charError.code === 'PGRST205') {
      console.log('❌ characters table does not exist - need to create it');
    } else if (charError) {
      console.log('❌ characters error:', charError.message);
    } else {
      console.log('✅ characters table already exists');
    }
    
    // Create storyboards table
    console.log('Creating storyboards table...');
    const { error: storyError } = await supabase
      .from('storyboards')
      .select('*')
      .limit(1);
    
    if (storyError && storyError.code === 'PGRST205') {
      console.log('❌ storyboards table does not exist - need to create it');
    } else if (storyError) {
      console.log('❌ storyboards error:', storyError.message);
    } else {
      console.log('✅ storyboards table already exists');
    }
    
    // Create styling_templates table
    console.log('Creating styling_templates table...');
    const { error: styleError } = await supabase
      .from('styling_templates')
      .select('*')
      .limit(1);
    
    if (styleError && styleError.code === 'PGRST205') {
      console.log('❌ styling_templates table does not exist - need to create it');
    } else if (styleError) {
      console.log('❌ styling_templates error:', styleError.message);
    } else {
      console.log('✅ styling_templates table already exists');
    }
    
    console.log('\n🎯 Summary:');
    console.log('The tables need to be created manually in the Supabase dashboard.');
    console.log('Please go to: https://supabase.com/dashboard/project/slxuebvxjqyxpnmhfzuu');
    console.log('1. Click on "SQL Editor"');
    console.log('2. Copy and paste the SQL from database-schema.sql');
    console.log('3. Click "Run"');
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

createTables();
