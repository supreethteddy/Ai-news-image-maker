import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import storageService from './storageService.js';
import LogoOverlayService from './logoOverlayService.js';
import { buildMasterPrompt, buildNegativePrompt } from '../utils/masterPrompting.js';
import { supabase } from '../lib/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini AI Service for LLM operations
export class GeminiService {
  static async generateStoryboard(articleText, brandPreferences = {}, sceneCount = 4) {
    try {
      const prompt = this.buildStoryboardPrompt(articleText, brandPreferences, sceneCount);
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            topP: 0.8,
            topK: 40
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      return this.parseStoryboardResponse(content);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate storyboard with Gemini AI');
    }
  }

  static async enhanceImagePrompt(originalPrompt, characterPersona = '', visualStyle = 'realistic', colorTheme = 'modern') {
    try {
      const prompt = this.buildEnhancementPrompt(originalPrompt, characterPersona, visualStyle, colorTheme);
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 500,
            topP: 0.8,
            topK: 40
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      return response.data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Gemini Enhancement Error:', error);
      throw new Error('Failed to enhance image prompt');
    }
  }

  static buildStoryboardPrompt(articleText, brandPreferences, sceneCount = 4) {
    const { visualStyle = 'realistic', colorTheme = 'modern', brandPersonality = '', targetAudience = '' } = brandPreferences;
    
    return `
Create a visual storyboard for this article. Break it down into ${sceneCount} compelling scenes.

Article: ${articleText}

Brand Preferences:
- Visual Style: ${visualStyle}
- Color Theme: ${colorTheme}
- Brand Personality: ${brandPersonality}
- Target Audience: ${targetAudience}

For each scene, provide:
1. A clear section title
2. Descriptive text explaining what happens
3. A detailed image prompt for AI image generation

Character Consistency: If there are recurring characters, describe them consistently across scenes.

Return the response in this JSON format:
{
  "title": "Story Title",
  "character_persona": "Description of main characters for consistency",
  "storyboard_parts": [
    {
      "section_title": "Scene Title",
      "text": "Scene description",
      "image_prompt": "Detailed prompt for image generation"
    }
  ]
}
`;
  }

  static buildEnhancementPrompt(originalPrompt, characterPersona, visualStyle, colorTheme) {
    return `
Enhance this image prompt for better AI image generation:

Original Prompt: ${originalPrompt}

Character Consistency: ${characterPersona || 'No specific characters'}

Style Requirements:
- Visual Style: ${visualStyle}
- Color Theme: ${colorTheme}

Make the prompt more specific by adding:
1. Exact character positions and actions
2. Specific lighting and atmosphere
3. Camera angle/perspective details
4. Key props and background elements
5. Facial expressions and body language
6. Brand-consistent colors and styling

Return only the enhanced prompt, nothing else.
`;
  }

  static parseStoryboardResponse(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing if JSON extraction fails
      throw new Error('Could not parse JSON from Gemini response');
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      // Return a fallback structure
      return {
        title: "Generated Story",
        character_persona: "A determined protagonist",
        storyboard_parts: [
          {
            section_title: "Opening Scene",
            text: "The story begins with an intriguing setup.",
            image_prompt: "A compelling opening scene with dramatic lighting and engaging composition"
          }
        ]
      };
    }
  }
}

// Banana AI Pro Service for Image Generation (using Gemini 3 Pro Nano)
// NOTE: The API endpoint and response structure below are placeholders.
// Update with actual Banana AI API documentation when available.
export class BananaAIService {
  /**
   * Generate character anchor image (reference image for consistency)
   * This creates the initial character image that will be used as reference for all scenes
   */
  static async generateCharacterAnchor(characterDescription, options = {}) {
    try {
      console.log('🎭 Generating character anchor image...');
      
      // Build a focused prompt for character generation
      const characterPrompt = `Full body portrait of: ${characterDescription}. Professional photography, clear facial features, neutral background, high detail, photorealistic, 8K resolution`;
      
      const negativePrompt = "blurry, low quality, distorted face, extra limbs, multiple people, text, watermarks";
      
      const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const response = await axios.post(imagenEndpoint, {
        contents: [{
          parts: [{
            text: `Generate a photorealistic character portrait: ${characterPrompt}\n\nAvoid: ${negativePrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.9,
          maxOutputTokens: 4096
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 90000
      });

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        throw new Error('No image data in character anchor response');
      }

      const imageData = response.data.candidates[0].content.parts[0].inlineData;
      const base64Image = imageData.data;
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      // Upload to Supabase Storage if userId provided
      if (options.userId) {
        if (!supabase) {
          console.error('Supabase client not initialized');
          throw new Error('Supabase storage not available');
        }

        const storyboardId = options.storyboardId || 'temp';
        const filename = `${options.userId}/characters/anchor-${Date.now()}.png`;
        const BUCKET_NAME = 'staiblstoryboard';
        
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filename, imageBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (error) {
          console.error('Error uploading character anchor:', error);
          throw new Error('Failed to upload character anchor image');
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filename);

        console.log('✅ Character anchor image created and uploaded');
        
        return {
          success: true,
          url: publicUrlData.publicUrl,
          base64: base64Image,
          buffer: imageBuffer
        };
      }

      return {
        success: true,
        base64: base64Image,
        buffer: imageBuffer
      };
    } catch (error) {
      console.error('Error generating character anchor:', error);
      throw error;
    }
  }

  static async generateImage(prompt, options = {}) {
    try {
      // Enhance prompt with master prompting techniques
      // Check if character reference images are provided for consistency
      const hasCharacterImage = options.character_reference_images && options.character_reference_images.length > 0;
      const forceCharacterInclusion = hasCharacterImage || (options.character_ref && options.character_ref.length > 0);
      
      // Detect if scene prompt mentions changing clothes OR day/setting changes (for clothing consistency)
      const sceneLower = prompt.toLowerCase();
      
      // Check for explicit clothing change mentions
      const explicitClothingChange = sceneLower.includes('change clothes') || 
                                    sceneLower.includes('different outfit') || 
                                    sceneLower.includes('new clothes') ||
                                    sceneLower.includes('wearing different') ||
                                    sceneLower.includes('changed outfit') ||
                                    sceneLower.includes('switched clothes');
      
      // Check for day/night transitions (clothing can change when day changes)
      const dayKeywords = ['day', 'morning', 'afternoon', 'dawn', 'sunrise', 'daylight', 'sunny day'];
      const nightKeywords = ['night', 'evening', 'dusk', 'sunset', 'midnight', 'dark', 'nighttime', 'late night'];
      const timeKeywords = ['next day', 'following day', 'later that day', 'the next morning', 'that evening'];
      
      // Extract time indicators from the prompt
      const hasDayTime = dayKeywords.some(keyword => sceneLower.includes(keyword));
      const hasNightTime = nightKeywords.some(keyword => sceneLower.includes(keyword));
      const hasTimeTransition = timeKeywords.some(keyword => sceneLower.includes(keyword));
      
      // Check for major setting changes that might warrant clothing change
      const settingChangeKeywords = ['different location', 'new setting', 'another place', 'different venue', 
                                      'indoor', 'outdoor', 'inside', 'outside', 'at home', 'at office', 
                                      'at work', 'at event', 'at party', 'formal event', 'casual setting'];
      const hasSettingChange = settingChangeKeywords.some(keyword => sceneLower.includes(keyword));
      
      // Allow clothing change if:
      // 1. Explicitly mentioned, OR
      // 2. Day/night transition detected, OR
      // 3. Time transition mentioned, OR
      // 4. Major setting change with context
      const allowClothingChange = explicitClothingChange || 
                                   hasTimeTransition || 
                                   (hasDayTime && hasNightTime) || // Both day and night mentioned
                                   (hasSettingChange && (hasDayTime || hasNightTime || hasTimeTransition));
      
      const maintainClothing = !allowClothingChange; // Maintain clothing unless change is justified
      
      const enhancedPrompt = buildMasterPrompt({
        basePrompt: prompt,
        type: options.type || "storyboard",
        visualStyle: options.visual_style || options.style || "realistic",
        characterRef: options.character_ref || "",
        lighting: options.lighting || "natural",
        priority: "quality",
        hasCharacterImage: hasCharacterImage,
        forceCharacterInclusion: forceCharacterInclusion,
        maintainClothing: maintainClothing
      });

      // Generate negative prompt with character consistency
      const negativePrompt = options.negativePrompt || buildNegativePrompt(options.type || "storyboard", forceCharacterInclusion);

      console.log('Generating image with enhanced prompt:', enhancedPrompt);
      console.log('Using negative prompt:', negativePrompt);
      
      // Determine style type from options and map to Ideogram enums
      const normalizeStyle = (value) => {
        if (!value) return 'GENERAL';
        const key = String(value).trim().toUpperCase();
        const map = {
          REALISTIC: 'REALISTIC',
          PHOTOREALISTIC: 'REALISTIC',
          PHOTO: 'REALISTIC',
          CINEMATIC: 'REALISTIC',
          CARTOON: 'STYLIZED',
          ANIME: 'STYLIZED',
          COMIC: 'STYLIZED',
          SKETCH: 'STYLIZED',
          WATERCOLOR: 'STYLIZED',
          OIL_PAINTING: 'REALISTIC',
          VECTOR: 'DESIGN',
          ILLUSTRATED: 'STYLIZED',
          ILLUSTRATION: 'STYLIZED',
          MINIMALIST: 'GENERAL',
          GENERAL: 'GENERAL',
          AUTO: 'AUTO',
          DESIGN: 'DESIGN',
          CUSTOM: 'CUSTOM',
          FICTION: 'FICTION',
          STYLIZED: 'STYLIZED'
        };
        return map[key] || 'GENERAL';
      };
      // According to Ideogram API docs, style_preset can only be used with AUTO or GENERAL style types
      const stylePresetMap = {
        AUTO: 'GOLDEN_HOUR',
        GENERAL: 'ABSTRACT_ORGANIC'
        // REALISTIC, STYLIZED, DESIGN, FICTION, CUSTOM cannot use style_preset
      };
      const requestedStyle = options.style_type || options.visual_style || options.style || 'GENERAL';
      let styleType = normalizeStyle(requestedStyle);
      
      // Use Google Gemini Pro Image Preview API with multimodal support
      console.log('🎨 Using Google Gemini Pro Image Preview for image generation');
      
      const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      // Build parts array - multimodal if character reference exists
      const parts = [];
      
      // Check if character reference image is provided (base64 format)
      const characterRefBase64 = options.characterReferenceBase64 || options.character_reference_base64;
      
      if (characterRefBase64) {
        console.log('🎭 Using character reference image for consistency (multimodal)');
        
        // Add text prompt with explicit instruction to use the reference
        parts.push({
          text: `Based EXACTLY on the character shown in the provided reference image, generate this scene: ${enhancedPrompt}\n\nMAINTAIN the character's EXACT facial features, hair style, hair color, body proportions, and physical appearance from the reference image.\n\nAvoid: ${negativePrompt}`
        });
        
        // Add character reference image
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: characterRefBase64
          }
        });
      } else {
        // Text-only generation (no character reference)
        parts.push({
          text: `Generate a photorealistic image: ${enhancedPrompt}\n\nNegative prompt (avoid these): ${negativePrompt}`
        });
      }
      
      const response = await axios.post(imagenEndpoint, {
        contents: [{
          parts: parts
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 90000
      });

      console.log('✅ Gemini Image API Response received');

      // Handle Gemini response - it returns inlineData with base64
      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const candidate = response.data.candidates[0];
        const content = candidate.content;
        
        // Extract base64 image from parts
        let base64Image = null;
        if (content && content.parts) {
          for (const part of content.parts) {
            if (part.inlineData && part.inlineData.data) {
              base64Image = part.inlineData.data;
              break;
            }
          }
        }
        
        if (!base64Image) {
          console.error('Full Gemini response:', JSON.stringify(response.data, null, 2));
          throw new Error('No image data in Gemini response');
        }
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(base64Image, 'base64');
        
        // Upload to Supabase Storage first
        let originalUrl;
        if (options.userId) {
          try {
            const uploadResult = await storageService.uploadStoryboardImageBuffer(
              imageBuffer,
              options.userId,
              options.storyboardId || 'temp',
              options.sceneIndex || 0,
              'image/png'
            );
            
            if (uploadResult.success) {
              originalUrl = uploadResult.publicUrl;
              console.log('✅ Image uploaded to Supabase Storage:', originalUrl);
            } else {
              throw new Error('Failed to upload to Supabase Storage');
            }
          } catch (uploadError) {
            console.error('⚠️ Error uploading to Supabase Storage:', uploadError.message);
            throw uploadError;
          }
        } else {
          throw new Error('UserId required for image upload');
        }
          
          // Handle logo overlay if logo is provided and user wants it included
          let processedImageUrl = originalUrl;
          if (options.logoUrl && options.includeLogo) {
            try {
              console.log('🎨 Applying logo overlay...');
              const overlaidImageBuffer = await LogoOverlayService.overlayLogo(originalUrl, options.logoUrl);
              
              // Save the overlaid image temporarily
              const tempFilename = `overlaid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
              const tempFilePath = await LogoOverlayService.saveOverlaidImage(overlaidImageBuffer, tempFilename);
              
              // Upload the overlaid image to Supabase Storage
              const uploadResult = await storageService.uploadStoryboardImageFromPath(
                tempFilePath,
                options.userId,
                options.storyboardId || 'temp',
                options.sceneIndex || 0,
                'image/png'
              );
              
              if (uploadResult.success) {
                processedImageUrl = uploadResult.publicUrl;
                console.log('✅ Logo overlay applied and uploaded:', processedImageUrl);
              } else {
                console.log('⚠️ Failed to upload overlaid image, using original:', uploadResult.error);
              }
              
              // Clean up temporary file
              await LogoOverlayService.cleanup(tempFilePath);
              
            } catch (overlayError) {
              console.log('⚠️ Error applying logo overlay:', overlayError.message);
              // Continue with original image if overlay fails
            }
          }
          
          // Upload to Supabase Storage if userId is provided and no logo overlay was applied
          let finalUrl = processedImageUrl;
          if (options.userId && (!options.logoUrl || !options.includeLogo)) {
            try {
              console.log('📤 Uploading generated image to Supabase Storage...');
              const uploadResult = await storageService.uploadStoryboardImage(
                processedImageUrl,
                options.userId,
                options.storyboardId || 'temp',
                options.sceneIndex || 0
              );
              
              if (uploadResult.success) {
                console.log('✅ Image uploaded to Supabase Storage:', uploadResult.publicUrl);
                finalUrl = uploadResult.publicUrl;
              } else {
                console.log('⚠️ Failed to upload to Supabase Storage, using original URL:', uploadResult.error);
              }
            } catch (uploadError) {
              console.log('⚠️ Error uploading to Supabase Storage:', uploadError.message);
            }
          }
          
          return {
            success: true,
            url: finalUrl,
            originalUrl: originalUrl,
            metadata: {
              prompt: prompt,
              model: 'google-gemini-imagen-3',
              dimensions: options?.aspect_ratio === '16x9' ? '1792x1024' : '1024x1024',
              style: styleType || 'GENERAL'
          }
        };
      } else {
        console.error('Invalid Gemini response:', JSON.stringify(response.data, null, 2));
        throw new Error('Invalid response format from Gemini Image API');
      }
    } catch (error) {
      console.error('Banana AI API Error:', error);
      
      // Return error instead of random fallback to identify real issues
      return {
        success: false,
        error: error.message,
        url: null,
        metadata: {
          prompt: prompt,
          model: 'ideogram-v3',
          error: 'Image generation failed'
        }
      };
    }
  }

  static async generateMultipleImages(prompts, options = {}) {
    const promises = prompts.map(prompt => this.generateImage(prompt, options));
    return Promise.all(promises);
  }

  static async getImageStatus(imageId) {
    try {
      // Banana AI image status check
      // TODO: Update with actual Banana AI endpoint when available
      const response = await axios.get(`https://api.banana.dev/v1/images/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error checking image status:', error);
      throw error;
    }
  }
}

// Legacy OpenAI Service (kept for fallback)
export class OpenAIService {
  static async generateStoryboard(articleText, brandPreferences = {}) {
    // Fallback to Gemini if OpenAI is not available
    return GeminiService.generateStoryboard(articleText, brandPreferences);
  }

  static async enhanceImagePrompt(originalPrompt, characterPersona = '', visualStyle = 'realistic', colorTheme = 'modern') {
    // Fallback to Gemini if OpenAI is not available
    return GeminiService.enhanceImagePrompt(originalPrompt, characterPersona, visualStyle, colorTheme);
  }
}

// Legacy Runware Service (kept for fallback)
export class RunwareService {
  static async generateImage(prompt, options = {}) {
    // Use Banana AI as primary image generation service
    return BananaAIService.generateImage(prompt, options);
  }

  static async generateMultipleImages(prompts, options = {}) {
    return BananaAIService.generateMultipleImages(prompts, options);
  }
}

export default { GeminiService, BananaAIService, OpenAIService, RunwareService };
