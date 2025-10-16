import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { GeminiService, IdeogramService } from '../services/aiService.js';
import storage from '../storage/inMemoryStorage.js';

const router = express.Router();

// Validation middleware
const validateStoryCreation = [
  body('original_text').notEmpty().withMessage('Original text is required'),
  body('title').optional().isString(),
  body('visual_style').optional().isString(),
  body('color_theme').optional().isString(),
  body('brand_preferences').optional().isObject()
];

// GET /api/stories - List all stories (with optional user filtering)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const stories = storage.listStories(userId);
    
    res.json({
      success: true,
      data: stories,
      count: stories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stories'
    });
  }
});

// GET /api/stories/:id - Get a specific story
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const story = storage.getStory(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch story'
    });
  }
});

// POST /api/stories - Create a new story
router.post('/', authenticateToken, validateStoryCreation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { original_text, title, visual_style, color_theme, brand_preferences, scene_count } = req.body;
    const userId = req.user.userId;

    // Calculate credits needed based on scene count
    const creditsNeeded = scene_count || 6; // Default to 6 if not provided
    
    // Check if user has enough credits
    const userCredits = await DatabaseService.getUserCredits(userId);
    if (userCredits < creditsNeeded) {
      return res.status(400).json({
        success: false,
        error: `Insufficient credits. You need ${creditsNeeded} credits for ${creditsNeeded} scenes, but you only have ${userCredits} credits.`
      });
    }

    // Generate storyboard using Gemini AI
    const storyboardData = await GeminiService.generateStoryboard(original_text, {
      visualStyle: visual_style || 'realistic',
      colorTheme: color_theme || 'modern',
      ...brand_preferences
    }, scene_count || 6);

    // Create story record
    const storyData = {
      user_id: userId,
      title: title || storyboardData.title,
      original_text,
      character_persona: storyboardData.character_persona,
      visual_style: visual_style || 'realistic',
      color_theme: color_theme || 'modern',
      storyboard_parts: storyboardData.storyboard_parts.map(part => ({
        section_title: part.section_title,
        text: part.text,
        image_prompt: part.image_prompt,
        image_url: null
      })),
      status: 'processing'
    };

    const story = storage.createStory(storyData);

    // Deduct credits based on scene count
    await DatabaseService.deductCredits(userId, creditsNeeded, `Story creation (${creditsNeeded} scenes)`);

    // Generate images asynchronously
    generateImagesForStory(story.id, storyboardData.storyboard_parts, visual_style, color_theme, storyboardData.character_persona);

    res.status(201).json({
      success: true,
      data: story,
      message: `Story created successfully. ${creditsNeeded} credits deducted for ${creditsNeeded} scenes. Images are being generated.`
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create story'
    });
  }
});

// PUT /api/stories/:id - Update a story
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const story = storage.getStory(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Check ownership
    if (story.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const updatedStory = storage.updateStory(req.params.id, req.body);
    
    res.json({
      success: true,
      data: updatedStory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update story'
    });
  }
});

// DELETE /api/stories/:id - Delete a story
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const story = storage.getStory(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Check ownership
    if (story.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    storage.deleteStory(req.params.id);
    
    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete story'
    });
  }
});

// POST /api/stories/:id/regenerate-image - Regenerate a specific image
router.post('/:id/regenerate-image', authenticateToken, async (req, res) => {
  try {
    const { partIndex, promptOverride } = req.body;
    const story = storage.getStory(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Check ownership
    if (story.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const part = story.storyboard_parts[partIndex];
    if (!part) {
      return res.status(404).json({
        success: false,
        error: 'Story part not found'
      });
    }

    // Enhance prompt if needed
    let enhancedPrompt = promptOverride || part.image_prompt;
    if (!promptOverride) {
      enhancedPrompt = await GeminiService.enhanceImagePrompt(
        part.image_prompt,
        story.character_persona,
        story.visual_style,
        story.color_theme
      );
    }

    // Generate new image using Ideogram
    const imageResult = await IdeogramService.generateImage(enhancedPrompt, {
      aspect_ratio: '16:9',
      style: story.visual_style || 'photorealistic'
    });
    
    if (imageResult.success) {
      // Update story with new image
      const updatedParts = [...story.storyboard_parts];
      updatedParts[partIndex] = {
        ...part,
        image_url: imageResult.url,
        image_prompt: enhancedPrompt
      };

      const updatedStory = storage.updateStory(req.params.id, {
        storyboard_parts: updatedParts
      });

      res.json({
        success: true,
        data: updatedStory,
        message: 'Image regenerated successfully'
      });
    } else {
      throw new Error('Failed to generate image');
    }
  } catch (error) {
    console.error('Error regenerating image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate image'
    });
  }
});

// Helper function to generate images for a story
async function generateImagesForStory(storyId, storyboardParts, visualStyle, colorTheme, characterPersona) {
  try {
    const story = storage.getStory(storyId);
    if (!story) return;

    const updatedParts = [...story.storyboard_parts];
    
      for (let i = 0; i < storyboardParts.length; i++) {
        try {
          // Enhance the prompt
          const enhancedPrompt = await GeminiService.enhanceImagePrompt(
            storyboardParts[i].image_prompt,
            characterPersona,
            visualStyle,
            colorTheme
          );

          // Generate image using Ideogram
          const imageResult = await IdeogramService.generateImage(enhancedPrompt, {
            aspect_ratio: '16:9',
            style: visualStyle || 'photorealistic'
          });
        
        if (imageResult.success) {
          updatedParts[i] = {
            ...updatedParts[i],
            image_url: imageResult.url,
            image_prompt: enhancedPrompt
          };
        }
      } catch (error) {
        console.error(`Error generating image for part ${i}:`, error);
      }
    }

    // Update story with all generated images
    storage.updateStory(storyId, {
      storyboard_parts: updatedParts,
      status: 'completed'
    });

  } catch (error) {
    console.error('Error in generateImagesForStory:', error);
    storage.updateStory(storyId, {
      status: 'failed'
    });
  }
}

export default router;
