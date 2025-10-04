import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://slxuebvxjqyxpnmhfzuu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNseHVlYnZ4anF5eHBubWhmenV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc2MjcxNCwiZXhwIjoyMDczMzM4NzE0fQ.njEEVHUIvHRnvfzQbHxHsToBnDn5jV40GsdYn0k4WY8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminAPI() {
  try {
    console.log('🧪 Testing admin storyboard API...');
    
    // First test the total count
    console.log('📊 Testing total storyboard count...');
    const { count, error: countError } = await supabase
      .from('storyboards')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count error:', countError);
    } else {
      console.log(`✅ Total storyboards in database: ${count}`);
    }
    
    // Test the exact query used by the admin API
    const { data, error } = await supabase
      .from('storyboards')
      .select(`
        *,
        user_profiles(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Query error:', error);
      return;
    }
    
    console.log('✅ Raw data from database:');
    data?.forEach((storyboard, index) => {
      console.log(`\n${index + 1}. "${storyboard.title}"`);
      console.log(`   - user_id: ${storyboard.user_id}`);
      console.log(`   - user_profiles:`, storyboard.user_profiles);
      console.log(`   - user_profiles?.name:`, storyboard.user_profiles?.name);
      console.log(`   - created_at: ${storyboard.created_at}`);
    });
    
    // Test the transformation
    console.log('\n🔄 After transformation:');
    const transformed = (data || []).map(storyboard => ({
      id: storyboard.id,
      title: storyboard.title,
      author: storyboard.user_profiles?.name || 'Unknown',
      createdAt: storyboard.created_at,
      status: storyboard.status || 'completed',
      parts: storyboard.storyboard_parts?.length || 0,
      views: 0,
      flags: 0,
      original_text: storyboard.original_text,
      storyboard_parts: storyboard.storyboard_parts
    }));
    
    transformed.forEach((storyboard, index) => {
      console.log(`\n${index + 1}. "${storyboard.title}"`);
      console.log(`   - author: "${storyboard.author}"`);
      console.log(`   - createdAt: ${storyboard.createdAt}`);
      console.log(`   - parts: ${storyboard.parts}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing admin API:', error);
  }
}

testAdminAPI();
