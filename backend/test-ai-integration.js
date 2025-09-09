#!/usr/bin/env node

// Test script for NewsPlay AI integrations
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testArticle = `
Breaking News: Scientists at MIT have developed a revolutionary AI system that can generate photorealistic images from text descriptions in real-time. The breakthrough technology, called "VisualGPT," uses advanced neural networks to understand complex prompts and create stunning visuals that are indistinguishable from photographs.

The research team, led by Dr. Sarah Chen, spent three years developing this technology. "This is a game-changer for content creators, marketers, and storytellers," said Dr. Chen in an interview. "We're seeing applications in everything from advertising to education."

The system can generate images in various styles including photorealistic, cinematic, illustrated, and artistic. Early tests show it performs exceptionally well with character consistency across multiple scenes, making it perfect for visual storytelling.

Companies like Disney, Netflix, and major advertising agencies have already expressed interest in licensing this technology. The team expects to release a public beta version within the next six months.
`;

const testBrandPreferences = {
  visualStyle: 'cinematic',
  colorTheme: 'modern',
  brandPersonality: 'Professional, innovative, trustworthy',
  targetAudience: 'Tech-savvy professionals and content creators'
};

async function testConnection() {
  console.log('🔍 Testing AI service connections...\n');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/test-connection`, {}, {
      headers: {
        'Authorization': 'Bearer test-token', // You'll need a real token for this
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Connection test results:');
    console.log(JSON.stringify(response.data.data, null, 2));
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

async function testStoryboardGeneration() {
  console.log('\n📝 Testing storyboard generation...\n');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/generate-storyboard`, {
      article_text: testArticle,
      brand_preferences: testBrandPreferences
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Storyboard generated successfully!');
    console.log('Title:', response.data.data.title);
    console.log('Character Persona:', response.data.data.character_persona);
    console.log('Number of scenes:', response.data.data.storyboard_parts.length);
    
    // Show first scene
    if (response.data.data.storyboard_parts.length > 0) {
      const firstScene = response.data.data.storyboard_parts[0];
      console.log('\nFirst Scene:');
      console.log('Title:', firstScene.section_title);
      console.log('Text:', firstScene.text);
      console.log('Image Prompt:', firstScene.image_prompt);
    }
  } catch (error) {
    console.log('❌ Storyboard generation failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

async function testImageGeneration() {
  console.log('\n🖼️  Testing image generation...\n');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/generate-image`, {
      prompt: 'A futuristic laboratory with scientists working on AI technology, cinematic lighting, modern color scheme',
      options: {
        aspect_ratio: '16:9',
        style: 'cinematic',
        magic_prompt: true
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Image generated successfully!');
    console.log('Image URL:', response.data.data.url);
    console.log('Metadata:', response.data.data.metadata);
  } catch (error) {
    console.log('❌ Image generation failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

async function testPromptEnhancement() {
  console.log('\n✨ Testing prompt enhancement...\n');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/enhance-prompt`, {
      original_prompt: 'A scientist in a lab',
      character_persona: 'Dr. Sarah Chen, Asian woman, 35 years old, wearing lab coat, determined expression',
      visual_style: 'cinematic',
      color_theme: 'modern'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Prompt enhanced successfully!');
    console.log('Original:', response.data.data.original_prompt);
    console.log('Enhanced:', response.data.data.enhanced_prompt);
  } catch (error) {
    console.log('❌ Prompt enhancement failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

async function testCompleteWorkflow() {
  console.log('\n🚀 Testing complete workflow...\n');
  
  try {
    // Step 1: Generate storyboard
    console.log('Step 1: Generating storyboard...');
    const storyboardResponse = await axios.post(`${API_BASE_URL}/ai/generate-storyboard`, {
      article_text: testArticle,
      brand_preferences: testBrandPreferences
    });
    
    const storyboard = storyboardResponse.data.data;
    console.log(`✅ Generated ${storyboard.storyboard_parts.length} scenes`);
    
    // Step 2: Generate images for each scene
    console.log('\nStep 2: Generating images for each scene...');
    for (let i = 0; i < Math.min(storyboard.storyboard_parts.length, 2); i++) {
      const scene = storyboard.storyboard_parts[i];
      
      console.log(`\nGenerating image for scene ${i + 1}: ${scene.section_title}`);
      
      const imageResponse = await axios.post(`${API_BASE_URL}/ai/generate-image`, {
        prompt: scene.image_prompt,
        options: {
          aspect_ratio: '16:9',
          style: testBrandPreferences.visualStyle,
          magic_prompt: true
        }
      });
      
      console.log(`✅ Image ${i + 1} generated: ${imageResponse.data.data.url}`);
    }
    
    console.log('\n🎉 Complete workflow test successful!');
  } catch (error) {
    console.log('❌ Complete workflow test failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

async function main() {
  console.log('🧪 NewsPlay AI Integration Test Suite');
  console.log('=====================================\n');
  
  // Check if backend is running
  try {
    await axios.get('http://localhost:3001/health');
    console.log('✅ Backend server is running\n');
  } catch (error) {
    console.log('❌ Backend server is not running. Please start it first.');
    console.log('Run: cd backend && npm run dev');
    process.exit(1);
  }
  
  // Run tests
  await testConnection();
  await testStoryboardGeneration();
  await testImageGeneration();
  await testPromptEnhancement();
  await testCompleteWorkflow();
  
  console.log('\n🏁 All tests completed!');
}

// Run the tests
main().catch(console.error);
