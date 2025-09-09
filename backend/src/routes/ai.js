import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { GeminiService, IdeogramService } from '../services/aiService.js';

const router = express.Router();

// Validation middleware
const validateStoryboardGeneration = [
  body('article_text').notEmpty().withMessage('Article text is required'),
  body('brand_preferences').optional().isObject()
];

const validateImageGeneration = [
  body('prompt').notEmpty().withMessage('Image prompt is required'),
  body('options').optional().isObject()
];

const validatePromptEnhancement = [
  body('original_prompt').notEmpty().withMessage('Original prompt is required'),
  body('character_persona').optional().isString(),
  body('visual_style').optional().isString(),
  body('color_theme').optional().isString()
];

// POST /api/ai/generate-storyboard - Generate storyboard from article
router.post('/generate-storyboard', optionalAuth, validateStoryboardGeneration, async (req, res) => {
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

    const { article_text, brand_preferences = {} } = req.body;

    const storyboardData = await GeminiService.generateStoryboard(article_text, brand_preferences);

    res.json({
      success: true,
      data: storyboardData,
      message: 'Storyboard generated successfully'
    });
  } catch (error) {
    console.error('Error generating storyboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate storyboard'
    });
  }
});

// POST /api/ai/enhance-prompt - Enhance an image prompt
router.post('/enhance-prompt', optionalAuth, validatePromptEnhancement, async (req, res) => {
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

    const { 
      original_prompt, 
      character_persona = '', 
      visual_style = 'realistic', 
      color_theme = 'modern' 
    } = req.body;

    const enhancedPrompt = await GeminiService.enhanceImagePrompt(
      original_prompt,
      character_persona,
      visual_style,
      color_theme
    );

    res.json({
      success: true,
      data: {
        original_prompt,
        enhanced_prompt: enhancedPrompt,
        character_persona,
        visual_style,
        color_theme
      },
      message: 'Prompt enhanced successfully'
    });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enhance prompt'
    });
  }
});

// POST /api/ai/generate-image - Generate a single image
router.post('/generate-image', optionalAuth, validateImageGeneration, async (req, res) => {
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

    const { prompt, options = {} } = req.body;

    const imageResult = await IdeogramService.generateImage(prompt, options);

    res.json({
      success: true,
      data: imageResult,
      message: 'Image generated successfully'
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate image'
    });
  }
});

// POST /api/ai/generate-multiple-images - Generate multiple images
router.post('/generate-multiple-images', optionalAuth, [
  body('prompts').isArray({ min: 1 }).withMessage('At least one prompt is required'),
  body('options').optional().isObject()
], async (req, res) => {
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

    const { prompts, options = {} } = req.body;

    // Limit to 5 images per request to prevent abuse
    if (prompts.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 images per request'
      });
    }

    const imageResults = await IdeogramService.generateMultipleImages(prompts, options);

    res.json({
      success: true,
      data: imageResults,
      message: `${imageResults.length} images generated successfully`
    });
  } catch (error) {
    console.error('Error generating multiple images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate images'
    });
  }
});

// GET /api/ai/models - Get available AI models
router.get('/models', optionalAuth, async (req, res) => {
  try {
    const models = {
      gemini: {
        storyboard: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        image_prompt_enhancement: ['gemini-1.5-flash'],
        features: ['JSON generation', 'Character consistency', 'Brand-aware prompts']
      },
      ideogram: {
        image_generation: ['ideogram-v1'],
        supported_formats: ['png', 'jpg', 'jpeg'],
        aspect_ratios: ['1:1', '4:3', '3:2', '16:9', '9:16', '3:4', '2:3'],
        styles: ['photorealistic', 'cinematic', 'illustrated', 'sketch', 'watercolor'],
        features: ['Magic prompt enhancement', 'Text in images', 'High quality']
      }
    };

    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI models'
    });
  }
});

// POST /api/ai/test-connection - Test AI service connections
router.post('/test-connection', authenticateToken, async (req, res) => {
  try {
    const results = {
      gemini: { connected: false, error: null },
      ideogram: { connected: false, error: null }
    };

    // Test Gemini connection
    try {
      await GeminiService.generateStoryboard('Test article for connection check.', {});
      results.gemini.connected = true;
    } catch (error) {
      results.gemini.error = error.message;
    }

    // Test Ideogram connection
    try {
      await IdeogramService.generateImage('Test prompt for connection check.');
      results.ideogram.connected = true;
    } catch (error) {
      results.ideogram.error = error.message;
    }

    res.json({
      success: true,
      data: results,
      message: 'AI service connection test completed'
    });
  } catch (error) {
    console.error('Error testing AI connections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test AI connections'
    });
  }
});

export default router;
