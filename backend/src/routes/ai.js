import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { GeminiService, BananaAIService } from '../services/aiService.js';

const router = express.Router();

// Validation middleware
const validateStoryboardGeneration = [
  body('article_text').notEmpty().withMessage('Article text is required'),
  body('brand_preferences').optional().isObject()
];

const validateImageGeneration = [
  body('prompt').notEmpty().withMessage('Image prompt is required'),
  body('options').optional().isObject(),
  body('character_reference_images').optional().isArray(),
  // Allow logoUrl to be undefined or a non-empty string; reject empty string
  body('logoUrl').optional({ nullable: true }).custom((v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length > 0)).withMessage('Invalid value'),
  body('includeLogo').optional().isBoolean()
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

    const { prompt, options = {}, character_reference_images = [], logoUrl, includeLogo } = req.body;

    // Merge character reference images into options and add user context
    const enhancedOptions = {
      ...options,
      // normalize possible camelCase from frontend
      visual_style: options.visualStyle || options.visual_style || options.style_type || options.style,
      color_theme: options.colorTheme || options.color_theme,
      character_reference_images: character_reference_images,
      logoUrl: typeof logoUrl === 'string' && logoUrl.trim().length > 0 ? logoUrl.trim() : undefined,
      includeLogo: typeof includeLogo === 'boolean' ? includeLogo : undefined,
      userId: req.user?.userId || null,
      storyboardId: options.storyboardId || null,
      sceneIndex: options.sceneIndex || 0
    };

    const imageResult = await BananaAIService.generateImage(prompt, enhancedOptions);

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

    const imageResults = await BananaAIService.generateMultipleImages(prompts, options);

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
      bananaAI: {
        image_generation: ['banana-ai-gemini-3-pro-nano'],
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
      bananaAI: { connected: false, error: null }
    };

    // Test Gemini connection
    try {
      await GeminiService.generateStoryboard('Test article for connection check.', {});
      results.gemini.connected = true;
    } catch (error) {
      results.gemini.error = error.message;
    }

    // Test Banana AI connection
    try {
      await BananaAIService.generateImage('Test prompt for connection check.');
      results.bananaAI.connected = true;
    } catch (error) {
      results.bananaAI.error = error.message;
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

// POST /api/ai/generate-character-anchor - Generate character anchor image for consistency
router.post('/generate-character-anchor', authenticateToken, [
  body('characterDescription').notEmpty().withMessage('Character description is required'),
  body('userId').optional().isString(),
  body('storyboardId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { characterDescription, userId, storyboardId } = req.body;

    console.log('🎭 Generating character anchor for consistency...');

    const anchorResult = await BananaAIService.generateCharacterAnchor(characterDescription, {
      userId: userId || req.user.userId,
      storyboardId: storyboardId
    });

    if (!anchorResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate character anchor image'
      });
    }

    res.json({
      success: true,
      url: anchorResult.url,
      base64: anchorResult.base64,
      message: 'Character anchor image generated successfully'
    });
  } catch (error) {
    console.error('Character anchor generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate character anchor'
    });
  }
});

export default router;
