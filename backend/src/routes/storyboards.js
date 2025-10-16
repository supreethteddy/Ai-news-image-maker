import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { checkCredits, deductCredits, addCreditBalance } from '../middleware/creditCheck.js';
import { canAccessStoryboard } from '../middleware/adminCheck.js';
import storage from '../storage/inMemoryStorage.js';
import DatabaseService from '../services/databaseService.js';

const router = express.Router();

// Legacy route for /stories/:id (for frontend compatibility)
router.get('/stories/:id', authenticateToken, canAccessStoryboard, async (req, res) => {
  try {
    const storyboard = await DatabaseService.getStoryboardById(req.params.id);
    
    if (!storyboard) {
      return res.status(404).json({
        success: false,
        message: 'Storyboard not found'
      });
    }

    res.json({
      success: true,
      data: storyboard
    });
  } catch (error) {
    console.error('Error fetching storyboard:', error);
    // Fallback to in-memory storage
    try {
      const storyboard = storage.getStoryboardById(req.params.id);
      
      if (!storyboard) {
        return res.status(404).json({
          success: false,
          message: 'Storyboard not found'
        });
      }

      // For fallback, still check ownership for non-admin users
      if (req.user.role !== 'admin' && storyboard.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: storyboard
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch storyboard'
      });
    }
  }
});

// Get all storyboards for authenticated user
router.get('/', authenticateToken, addCreditBalance, async (req, res) => {
  try {
    const storyboards = await DatabaseService.getStoryboardsByUser(req.user.userId);
    res.json({
      success: true,
      data: storyboards,
      userCredits: res.locals.userCredits
    });
  } catch (error) {
    console.error('Error fetching storyboards from database:', error);
    // Only fallback to in-memory storage if database is completely unavailable
    try {
      const storyboards = storage.getStoryboardsByUser(req.user.userId);
      // Filter out any potential duplicates by ID
      const uniqueStoryboards = storyboards.filter((storyboard, index, self) => 
        index === self.findIndex(s => s.id === storyboard.id)
      );
      res.json({
        success: true,
        data: uniqueStoryboards,
        userCredits: res.locals.userCredits
      });
    } catch (fallbackError) {
      console.error('Error fetching from in-memory storage:', fallbackError);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch storyboards'
      });
    }
  }
});

// Get a specific storyboard by ID
router.get('/:id', authenticateToken, canAccessStoryboard, async (req, res) => {
  try {
    const storyboard = await DatabaseService.getStoryboardById(req.params.id);
    
    if (!storyboard) {
      return res.status(404).json({
        success: false,
        message: 'Storyboard not found'
      });
    }

    res.json({
      success: true,
      data: storyboard
    });
  } catch (error) {
    console.error('Error fetching storyboard:', error);
    // Fallback to in-memory storage
    try {
      const storyboard = storage.getStoryboardById(req.params.id);
      
      if (!storyboard) {
        return res.status(404).json({
          success: false,
          message: 'Storyboard not found'
        });
      }

      // For fallback, still check ownership for non-admin users
      if (req.user.role !== 'admin' && storyboard.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: storyboard
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch storyboard'
      });
    }
  }
});

// Public: Get a storyboard by slug (SEO-friendly URL)
router.get('/public/story/:slug', async (req, res) => {
  try {
    const storyboard = await DatabaseService.getStoryboardBySlug(req.params.slug);

    if (!storyboard) {
      return res.status(404).json({
        success: false,
        message: 'Storyboard not found'
      });
    }

    // Return only public-safe fields
    return res.json({
      success: true,
      data: {
        id: storyboard.id,
        title: storyboard.title,
        original_text: storyboard.original_text,
        storyboard_parts: storyboard.storyboard_parts,
        slug: storyboard.slug
      }
    });
  } catch (error) {
    console.error('Error fetching public storyboard by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storyboard'
    });
  }
});

// Public: Get a storyboard by id (read-only, limited fields) - Legacy support
router.get('/public/:id', async (req, res) => {
  try {
    try {
      const storyboard = await DatabaseService.getStoryboardById(req.params.id);

      if (!storyboard) {
        return res.status(404).json({
          success: false,
          message: 'Storyboard not found'
        });
      }

      // Return only public-safe fields
      return res.json({
        success: true,
        data: {
          id: storyboard.id,
          title: storyboard.title,
          original_text: storyboard.original_text,
          storyboard_parts: storyboard.storyboard_parts,
          slug: storyboard.slug
        }
      });
    } catch (dbError) {
      // Fallback to in-memory storage if DB fails
      const storyboard = storage.getStoryboardById(req.params.id);
      if (!storyboard) {
        return res.status(404).json({
          success: false,
          message: 'Storyboard not found'
        });
      }
      return res.json({
        success: true,
        data: {
          id: storyboard.id,
          title: storyboard.title,
          original_text: storyboard.originalText || storyboard.original_text,
          storyboard_parts: storyboard.storyboardParts || storyboard.storyboard_parts
        }
      });
    }
  } catch (error) {
    console.error('Error fetching public storyboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storyboard'
    });
  }
});

// Create a new storyboard
router.post('/', 
  authenticateToken, 
  [
    body('title').notEmpty().withMessage('Storyboard title is required'),
    body('original_text').notEmpty().withMessage('Original text is required'),
    body('storyboard_parts').isArray().withMessage('Storyboard parts must be an array'),
    body('character_id').optional().isString(),
    body('visual_style').optional().isString(),
    body('scene_count').optional().isInt({ min: 3, max: 10 }).withMessage('Scene count must be between 3 and 10')
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, original_text, storyboard_parts, character_id, visual_style, scene_count } = req.body;
    
    // Calculate credits needed based on scene count
    const creditsNeeded = scene_count || 6; // Default to 6 if not provided
    
    // Check if user has enough credits
    const userCredits = await DatabaseService.getUserCredits(req.user.userId);
    if (userCredits < creditsNeeded) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. You need ${creditsNeeded} credits for ${creditsNeeded} scenes, but you only have ${userCredits} credits.`
      });
    }

    const storyboardData = {
      title,
      original_text,
      storyboard_parts,
      character_id,
      style: visual_style || 'realistic',
      scene_count: scene_count || 6, // Default to 6 if not provided
      user_id: req.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const storyboard = await DatabaseService.createStoryboard(storyboardData);

    // Deduct credits based on scene count
    await DatabaseService.deductCredits(req.user.userId, creditsNeeded, `Storyboard creation (${creditsNeeded} scenes)`);

    // Get updated credit balance after deduction
    const updatedUserCredits = await DatabaseService.getUserCredits(req.user.userId);

    res.status(201).json({
      success: true,
      data: storyboard,
      message: `Storyboard saved successfully. ${creditsNeeded} credits deducted for ${creditsNeeded} scenes.`,
      userCredits: updatedUserCredits
    });
  } catch (error) {
    console.error('Error creating storyboard:', error);
    // Fallback to in-memory storage
    try {
      const fallbackData = {
        title,
        originalText,
        storyboardParts,
        characterId,
        style: style || 'realistic',
        userId: req.user.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const storyboard = storage.createStoryboard(fallbackData);
      
      res.status(201).json({
        success: true,
        data: storyboard,
        message: 'Storyboard saved successfully (fallback)'
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to create storyboard'
      });
    }
  }
});

// Update a storyboard
router.put('/:id', authenticateToken, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  // Accept both snake_case and camelCase payloads from frontend
  body('original_text').optional().notEmpty(),
  body('originalText').optional().notEmpty(),
  body('storyboard_parts').optional().isArray(),
  body('storyboardParts').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Prefer database; fall back to in-memory storage only if DB fails
    const normalized = {
      // prefer snake_case fields for DB
      title: req.body.title,
      original_text: req.body.original_text ?? req.body.originalText,
      storyboard_parts: req.body.storyboard_parts ?? req.body.storyboardParts,
      updated_at: new Date().toISOString()
    };

    try {
      const updated = await DatabaseService.updateStoryboard(req.params.id, normalized);
      return res.json({
        success: true,
        data: updated,
        message: 'Storyboard updated successfully'
      });
    } catch (dbErr) {
      console.warn('DB update failed, falling back to memory:', dbErr?.message);
      const existing = storage.getStoryboardById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Storyboard not found' });
      }
      if (existing.userId !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      const updatedStoryboard = storage.updateStoryboard(req.params.id, updateData);
      return res.json({ success: true, data: updatedStoryboard, message: 'Storyboard updated successfully (fallback)' });
    }
  } catch (error) {
    console.error('Error updating storyboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update storyboard'
    });
  }
});

// Delete a storyboard
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Try database first
    try {
      const storyboard = await DatabaseService.getStoryboardById(req.params.id);
      
      if (!storyboard) {
        return res.status(404).json({
          success: false,
          message: 'Storyboard not found'
        });
      }

      // Check if storyboard belongs to the authenticated user
      if (storyboard.user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await DatabaseService.deleteStoryboard(req.params.id);
      
      res.json({
        success: true,
        message: 'Storyboard deleted successfully'
      });
    } catch (dbError) {
      console.error('Database delete failed, trying in-memory storage:', dbError);
      
      // Fallback to in-memory storage
      const storyboard = storage.getStoryboardById(req.params.id);
      
      if (!storyboard) {
        return res.status(404).json({
          success: false,
          message: 'Storyboard not found'
        });
      }

      // Check if storyboard belongs to the authenticated user
      if (storyboard.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      storage.deleteStoryboard(req.params.id);

      res.json({
        success: true,
        message: 'Storyboard deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting storyboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete storyboard'
    });
  }
});

// Download storyboard image proxy endpoint
router.get('/:id/images/:imageIndex/download', authenticateToken, async (req, res) => {
  try {
    const storyboard = storage.getStoryboardById(req.params.id);
    
    if (!storyboard) {
      return res.status(404).json({
        success: false,
        message: 'Storyboard not found'
      });
    }

    // Check if storyboard belongs to the authenticated user
    if (storyboard.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= storyboard.storyboardParts.length) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const imageUrl = storyboard.storyboardParts[imageIndex].imageUrl;
    if (!imageUrl) {
      return res.status(404).json({
        success: false,
        message: 'Image URL not found'
      });
    }

    // Download the image from the external URL
    const axios = (await import('axios')).default;
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 30000
    });

    // Set appropriate headers for download
    res.setHeader('Content-Type', imageResponse.headers['content-type'] || 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${storyboard.title}-scene-${imageIndex + 1}.jpg"`);
    imageResponse.data.pipe(res); // Pipe the image stream to the response
  } catch (error) {
    console.error('Error downloading storyboard image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download image'
    });
  }
});

// Styling Templates routes
// Get all styling templates for authenticated user
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = await DatabaseService.getStylingTemplatesByUser(req.user.userId);
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching styling templates:', error);
    // Fallback to in-memory storage
    try {
      const templates = storage.getStylingTemplatesByUser(req.user.userId);
      res.json({
        success: true,
        data: templates
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch styling templates'
      });
    }
  }
});

// Create a new styling template
router.post('/templates', authenticateToken, [
  body('name').notEmpty().withMessage('Template name is required'),
  body('visual_style').notEmpty().withMessage('Visual style is required'),
  body('color_theme').notEmpty().withMessage('Color theme is required'),
  body('logo_url').optional().isString(),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const templateData = {
      ...req.body,
      user_id: req.user.userId
    };

    const template = await DatabaseService.createStylingTemplate(templateData);
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating styling template:', error);
    // Fallback to in-memory storage
    try {
      const template = storage.createStylingTemplate({
        ...req.body,
        userId: req.user.userId
      });
      res.status(201).json({
        success: true,
        data: template
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to create styling template'
      });
    }
  }
});

// Delete a styling template
router.delete('/templates/:id', authenticateToken, async (req, res) => {
  try {
    await DatabaseService.deleteStylingTemplate(req.params.id);
    res.json({
      success: true,
      message: 'Styling template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting styling template:', error);
    // Fallback to in-memory storage
    try {
      storage.deleteStylingTemplate(req.params.id);
      res.json({
        success: true,
        message: 'Styling template deleted successfully'
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete styling template'
      });
    }
  }
});

export default router;
