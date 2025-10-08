import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@newsplaystudio.com',
      password: 'qweqwe',
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Then, create the user profile in the database
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: 'admin@newsplaystudio.com',
        name: 'Admin User',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      return;
    }

    console.log('✅ User profile created:', profileData);

    // Test the login
    console.log('🔑 Testing admin login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@newsplaystudio.com',
      password: 'qweqwe'
    });

    if (loginError) {
      console.error('❌ Error testing login:', loginError);
      return;
    }

    console.log('✅ Admin login successful!');
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@newsplaystudio.com');
    console.log('🔑 Password: qweqwe');
    console.log('👤 Role: admin');
    console.log('🆔 User ID:', authData.user.id);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createAdminUser();




