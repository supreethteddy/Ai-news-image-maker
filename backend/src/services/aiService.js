import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import storageService from './storageService.js';
import LogoOverlayService from './logoOverlayService.js';
import { buildMasterPrompt, buildNegativePrompt } from '../utils/masterPrompting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini AI Service for LLM operations
export class GeminiService {
  static async generateStoryboard(articleText, brandPreferences = {}, sceneCount = 6) {
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

  static buildStoryboardPrompt(articleText, brandPreferences, sceneCount = 6) {
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

// Ideogram Service for Image Generation
export class IdeogramService {
  static async generateImage(prompt, options = {}) {
    try {
      // Enhance prompt with master prompting techniques
      const enhancedPrompt = buildMasterPrompt({
        basePrompt: prompt,
        type: options.type || "storyboard",
        visualStyle: options.visual_style || options.style || "realistic",
        characterRef: options.character_ref || "",
        lighting: options.lighting || "natural",
        priority: "quality"
      });

      // Generate negative prompt
      const negativePrompt = options.negativePrompt || buildNegativePrompt(options.type || "storyboard");

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
      
      // If character reference images are provided, send as multipart/form-data with binary
      if (options.character_reference_images && options.character_reference_images.length > 0) {
        const FormData = (await import('form-data')).default;
        const formData = new FormData();

        formData.append('prompt', enhancedPrompt);
        formData.append('negative_prompt', negativePrompt);
        formData.append('rendering_speed', 'TURBO');
        formData.append('num_images', '1');
        formData.append('aspect_ratio', options?.aspect_ratio || '16x9');
        formData.append('magic_prompt', options?.magic_prompt === true ? 'ON' : 'OFF');
        // Character reference supports a limited set; fallback if unsupported
        const crAllowed = new Set(['AUTO', 'REALISTIC', 'FICTION']);
        formData.append('style_type', crAllowed.has(styleType) ? styleType : 'REALISTIC');
        // Only apply style_preset for AUTO or GENERAL style types
        const presetKey = stylePresetMap[styleType];
        if (presetKey && (styleType === 'AUTO' || styleType === 'GENERAL')) {
          formData.append('style_preset', presetKey);
        }
        // Add color theme if provided
        if (options?.color_theme) {
          formData.append('color_theme', String(options.color_theme).toUpperCase());
        }

        // Load first reference image (Ideogram supports one or multiple; we pass all provided)
        for (const imageUrl of options.character_reference_images) {
          try {
            let buffer;
            if (typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/')) {
              const relativePath = imageUrl.replace('/uploads/', '');
              const absolutePath = path.join(__dirname, '../../uploads', relativePath);
              const fileData = await fs.readFile(absolutePath);
              buffer = Buffer.from(fileData);
            } else if (typeof imageUrl === 'string' && imageUrl.startsWith('https://ai-news-image-maker.onrender.com/uploads/')) {
              const relativePath = imageUrl.replace('https://ai-news-image-maker.onrender.com/uploads/', '');
              const absolutePath = path.join(__dirname, '../../uploads', relativePath);
              const fileData = await fs.readFile(absolutePath);
              buffer = Buffer.from(fileData);
            } else {
              const resp = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
              buffer = Buffer.from(resp.data);
            }
            formData.append('character_reference_images', buffer, { filename: 'character_reference.jpg', contentType: 'image/jpeg' });
          } catch (refErr) {
            console.error('Failed to load character reference image:', refErr);
          }
        }

        const response = await axios.post('https://api.ideogram.ai/v1/ideogram-v3/generate', formData, {
          headers: {
            'Api-Key': process.env.IDEOGRAM_API_KEY,
            ...formData.getHeaders()
          },
          timeout: 30000
        });

        console.log('Ideogram API Response:', response.data);

        if (response.data && response.data.data && response.data.data[0] && response.data.data[0].url) {
          const originalUrl = response.data.data[0].url;
          
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
              model: 'ideogram-v3',
              dimensions: response.data.data[0].resolution || '1024x1024',
              style: response.data.data[0].style_type || 'GENERAL',
              seed: response.data.data[0].seed
            }
          };
        } else {
          throw new Error('Invalid response from Ideogram API');
        }
      }

      // Fallback: JSON request without character reference
      const response = await axios.post('https://api.ideogram.ai/v1/ideogram-v3/generate', {
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt,
        rendering_speed: 'TURBO',
        num_images: 1,
        style_type: styleType,
        aspect_ratio: options?.aspect_ratio || '16x9', // Fixed: Default to correct format
        ...(stylePresetMap[styleType] && (styleType === 'AUTO' || styleType === 'GENERAL') ? { style_preset: stylePresetMap[styleType] } : {}),
        ...(options?.color_theme ? { color_theme: String(options.color_theme).toUpperCase() } : {}),
        // Reduce magic prompt impact to avoid overriding style
        magic_prompt: options?.magic_prompt === true ? 'ON' : 'OFF'
      }, {
        headers: {
          'Api-Key': process.env.IDEOGRAM_API_KEY,
        	  'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Ideogram API Response:', response.data);

      if (response.data && response.data.data && response.data.data[0] && response.data.data[0].url) {
        const originalUrl = response.data.data[0].url;
        
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
            model: 'ideogram-v3',
            dimensions: response.data.data[0].resolution || '1024x1024',
            style: response.data.data[0].style_type || 'GENERAL',
            seed: response.data.data[0].seed
          }
        };
      } else {
        throw new Error('Invalid response from Ideogram API');
      }
    } catch (error) {
      console.error('Ideogram API Error:', error);
      
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
      const response = await axios.get(`https://api.ideogram.ai/v1/images/${imageId}`, {
        headers: {
          'Api-Key': process.env.IDEOGRAM_API_KEY
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
    // Use Ideogram as primary image generation service
    return IdeogramService.generateImage(prompt, options);
  }

  static async generateMultipleImages(prompts, options = {}) {
    return IdeogramService.generateMultipleImages(prompts, options);
  }
}

export default { GeminiService, IdeogramService, OpenAIService, RunwareService };
