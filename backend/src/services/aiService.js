import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini AI Service for LLM operations
export class GeminiService {
  static async generateStoryboard(articleText, brandPreferences = {}) {
    try {
      const prompt = this.buildStoryboardPrompt(articleText, brandPreferences);
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

  static buildStoryboardPrompt(articleText, brandPreferences) {
    const { visualStyle = 'realistic', colorTheme = 'modern', brandPersonality = '', targetAudience = '' } = brandPreferences;
    
    return `
Create a visual storyboard for this article. Break it down into 3-6 compelling scenes.

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
      console.log('Generating image with prompt:', prompt);
      
      // If character reference images are provided, send as multipart/form-data with binary
      if (options.character_reference_images && options.character_reference_images.length > 0) {
        const FormData = (await import('form-data')).default;
        const formData = new FormData();

        formData.append('prompt', prompt);
        formData.append('rendering_speed', 'TURBO');
        formData.append('num_images', '1');
        // Character reference only supports AUTO, REALISTIC, FICTION
        formData.append('style_type', 'REALISTIC');

        // Load first reference image (Ideogram supports one or multiple; we pass all provided)
        for (const imageUrl of options.character_reference_images) {
          try {
            let buffer;
            if (typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/')) {
              const relativePath = imageUrl.replace('/uploads/', '');
              const absolutePath = path.join(__dirname, '../../uploads', relativePath);
              const fileData = await fs.readFile(absolutePath);
              buffer = Buffer.from(fileData);
            } else if (typeof imageUrl === 'string' && imageUrl.startsWith('http://localhost:3001/uploads/')) {
              const relativePath = imageUrl.replace('http://localhost:3001/uploads/', '');
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
          return {
            success: true,
            url: response.data.data[0].url,
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
        prompt: prompt,
        rendering_speed: 'TURBO',
        num_images: 1
      }, {
        headers: {
          'Api-Key': process.env.IDEOGRAM_API_KEY,
        	  'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Ideogram API Response:', response.data);

      if (response.data && response.data.data && response.data.data[0] && response.data.data[0].url) {
        return {
          success: true,
          url: response.data.data[0].url,
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
      
      // Always return a fallback image for faster demo experience
      console.log('Using fallback image for faster demo experience');
      return {
        success: true,
        url: `https://picsum.photos/1024/576?random=${Math.floor(Math.random() * 1000)}`,
        metadata: {
          prompt: prompt,
          model: 'fallback',
          dimensions: '16:9',
          note: 'Fast fallback image for demo'
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
