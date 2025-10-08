// Test script to verify admin access
// Run this with: node test-admin-access.js

import fetch from 'node-fetch';

const API_BASE = 'https://ai-news-image-maker.onrender.com/api';
const ADMIN_EMAIL = 'admin@newsplaystudio.com';
const ADMIN_PASSWORD = 'qweqwe';

async function testAdminAccess() {
  try {
    console.log('🔐 Testing admin access...');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('👤 User role:', loginData.data.role);
    
    if (loginData.data.role !== 'admin') {
      console.error('❌ User is not an admin!');
      return;
    }

    const token = loginData.data.token;
    
    // Step 2: Test storyboard access
    console.log('2. Testing storyboard access...');
    
    // First, get a list of storyboards to find one to test
    const storyboardsResponse = await fetch(`${API_BASE}/storyboards`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!storyboardsResponse.ok) {
      console.error('❌ Failed to fetch storyboards:', await storyboardsResponse.text());
      return;
    }

    const storyboardsData = await storyboardsResponse.json();
    console.log('✅ Storyboards fetched successfully');
    console.log(`📊 Found ${storyboardsData.data.length} storyboards`);

    if (storyboardsData.data.length > 0) {
      const testStoryboardId = storyboardsData.data[0].id;
      console.log(`🧪 Testing access to storyboard: ${testStoryboardId}`);
      
      // Test accessing a specific storyboard
      const storyboardResponse = await fetch(`${API_BASE}/storyboards/${testStoryboardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (storyboardResponse.ok) {
        console.log('✅ Admin can access storyboard successfully!');
        const storyboardData = await storyboardResponse.json();
        console.log('📝 Storyboard title:', storyboardData.data.title);
      } else {
        console.error('❌ Failed to access storyboard:', await storyboardResponse.text());
      }
    } else {
      console.log('ℹ️ No storyboards found to test with');
    }

    console.log('🎉 Admin access test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAdminAccess();
