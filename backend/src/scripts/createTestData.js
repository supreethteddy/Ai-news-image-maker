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

async function createTestData() {
  try {
    console.log('🔧 Creating test data for admin dashboard...');
    
    // Create test users
    const testUsers = [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
        credits: 5
      },
      {
        email: 'jane.smith@example.com', 
        name: 'Jane Smith',
        role: 'user',
        credits: 15
      },
      {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson', 
        role: 'user',
        credits: 0
      }
    ];

    const createdUsers = [];
    
    for (const userData of testUsers) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      });

      if (authError) {
        console.error(`❌ Error creating auth user ${userData.email}:`, authError);
        continue;
      }

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          credits: userData.credits,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Error creating profile for ${userData.email}:`, profileError);
        continue;
      }

      createdUsers.push(profileData);
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    // Create test storyboards
    const testStoryboards = [
      {
        user_id: createdUsers[0]?.id,
        title: 'The Great Adventure',
        original_text: 'A brave knight embarks on a quest to save the kingdom from an ancient dragon.',
        status: 'completed',
        storyboard_parts: [
          {
            scene_number: 1,
            description: 'The knight prepares for battle',
            image_prompt: 'A knight in shining armor preparing his sword'
          },
          {
            scene_number: 2, 
            description: 'The knight approaches the dragon',
            image_prompt: 'A knight facing a massive dragon'
          }
        ]
      },
      {
        user_id: createdUsers[1]?.id,
        title: 'Space Odyssey',
        original_text: 'An astronaut discovers a mysterious planet with ancient alien technology.',
        status: 'completed',
        storyboard_parts: [
          {
            scene_number: 1,
            description: 'The astronaut lands on the planet',
            image_prompt: 'An astronaut landing on an alien planet'
          },
          {
            scene_number: 2,
            description: 'The astronaut explores ancient ruins',
            image_prompt: 'An astronaut exploring mysterious alien ruins'
          }
        ]
      },
      {
        user_id: createdUsers[2]?.id,
        title: 'Ocean Depths',
        original_text: 'A deep-sea explorer discovers a lost underwater city.',
        status: 'pending',
        storyboard_parts: [
          {
            scene_number: 1,
            description: 'The explorer dives into the deep ocean',
            image_prompt: 'A deep-sea diver exploring the ocean depths'
          }
        ]
      }
    ];

    for (const storyboard of testStoryboards) {
      if (!storyboard.user_id) continue;
      
      const { data: storyData, error: storyError } = await supabase
        .from('storyboards')
        .insert({
          user_id: storyboard.user_id,
          title: storyboard.title,
          original_text: storyboard.original_text,
          status: storyboard.status,
          storyboard_parts: storyboard.storyboard_parts,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (storyError) {
        console.error(`❌ Error creating storyboard:`, storyError);
      } else {
        console.log(`✅ Created storyboard: ${storyboard.title}`);
      }
    }

    // Create test credit transactions
    for (const user of createdUsers) {
      // Initial credit transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'initial',
          amount: user.credits,
          description: 'Initial credits',
          reference_type: 'signup',
          created_at: new Date().toISOString()
        });

      // Some usage transactions
      if (user.credits > 0) {
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'deduction',
            amount: -1,
            description: 'Storyboard generation',
            reference_type: 'storyboard',
            created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          });
      }
    }

    // Create test credit purchases
    const { data: packages } = await supabase
      .from('credit_packages')
      .select('*')
      .limit(1);

    if (packages && packages.length > 0) {
      const packageId = packages[0].id;
      
      await supabase
        .from('credit_purchases')
        .insert({
          user_id: createdUsers[1].id,
          package_id: packageId,
          credits_purchased: 10,
          bonus_credits: 2,
          total_credits: 12,
          amount_paid: 9.99,
          payment_method: 'demo',
          payment_status: 'completed',
          payment_id: `demo_${Date.now()}`,
          created_at: new Date().toISOString()
        });

      console.log('✅ Created test credit purchase');
    }

    console.log('🎉 Test data created successfully!');
    console.log('📊 Admin dashboard should now show real data');
    console.log('👥 Created users with different credit balances');
    console.log('📚 Created storyboards with different statuses');
    console.log('💳 Created credit transactions and purchases');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

// Run the script
createTestData();
