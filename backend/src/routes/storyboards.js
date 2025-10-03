import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import storage from '../storage/inMemoryStorage.js';
import DatabaseService from '../services/databaseService.js';

const router = express.Router();

// Legacy route for /stories/:id (for frontend compatibility)
router.get('/stories/:id', authenticateToken, async (req, res) => {
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

      // Check if storyboard belongs to the authenticated user
      if (storyboard.userId !== req.user.userId) {
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
router.get('/', authenticateToken, async (req, res) => {
  try {
    const storyboards = await DatabaseService.getStoryboardsByUser(req.user.userId);
    res.json({
      success: true,
      data: storyboards
    });
  } catch (error) {
    console.error('Error fetching storyboards:', error);
    // Fallback to in-memory storage
    try {
      const storyboards = storage.getStoryboardsByUser(req.user.userId);
      res.json({
        success: true,
        data: storyboards
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch storyboards'
      });
    }
  }
});

// Get a specific storyboard by ID
router.get('/:id', authenticateToken, async (req, res) => {
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

      // Check if storyboard belongs to the authenticated user
      if (storyboard.userId !== req.user.userId) {
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

// Create a new storyboard
router.post('/', authenticateToken, [
  body('title').notEmpty().withMessage('Storyboard title is required'),
  body('original_text').notEmpty().withMessage('Original text is required'),
  body('storyboard_parts').isArray().withMessage('Storyboard parts must be an array'),
  body('character_id').optional().isString(),
  body('visual_style').optional().isString()
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

    const { title, original_text, storyboard_parts, character_id, visual_style } = req.body;

    const storyboardData = {
      title,
      original_text,
      storyboard_parts,
      character_id,
      style: visual_style || 'realistic',
      user_id: req.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const storyboard = await DatabaseService.createStoryboard(storyboardData);

    res.status(201).json({
      success: true,
      data: storyboard,
      message: 'Storyboard saved successfully'
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

export default router;
