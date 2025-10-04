import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { DatabaseService } from '../services/databaseService.js';

const router = express.Router();

// Validation middleware
const validateBrandProfile = [
  body('brand_name').notEmpty().withMessage('Brand name is required'),
  body('core_colors').optional().isArray(),
  body('brand_personality').optional().isString(),
  body('visual_style_preference').optional().isString(),
  body('mood_preference').optional().isString(),
  body('target_audience').optional().isString(),
  body('design_language_notes').optional().isString(),
  body('reference_images').optional().isArray(),
  body('is_default').optional().isBoolean()
];

// GET /api/brands - List all brand profiles for the user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const brandProfiles = await DatabaseService.getBrandProfilesByUser(userId);
    
    res.json({
      success: true,
      data: brandProfiles,
      count: brandProfiles.length
    });
  } catch (error) {
    console.error('Error fetching brand profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brand profiles'
    });
  }
});

// GET /api/brands/default - Get the default brand profile (must be before /:id route)
router.get('/default', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const defaultProfile = await DatabaseService.getDefaultBrandProfile(userId);
    
    if (!defaultProfile) {
      return res.status(404).json({
        success: false,
        error: 'No default brand profile found'
      });
    }

    res.json({
      success: true,
      data: defaultProfile
    });
  } catch (error) {
    console.error('Error fetching default brand profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch default brand profile'
    });
  }
});

// GET /api/brands/:id - Get a specific brand profile
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const brandProfile = await DatabaseService.getBrandProfileById(req.params.id);
    
    if (!brandProfile) {
      return res.status(404).json({
        success: false,
        error: 'Brand profile not found'
      });
    }

    // Check ownership
    if (brandProfile.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: brandProfile
    });
  } catch (error) {
    console.error('Error fetching brand profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brand profile'
    });
  }
});

// POST /api/brands - Create a new brand profile
router.post('/', authenticateToken, validateBrandProfile, async (req, res) => {
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

    const userId = req.user.userId;
    const brandData = {
      user_id: userId,
      ...req.body
    };

    // If this is set as default, unset other defaults
    if (brandData.is_default) {
      const existingProfiles = await DatabaseService.getBrandProfilesByUser(userId);
      for (const profile of existingProfiles) {
        if (profile.is_default) {
          await DatabaseService.updateBrandProfile(profile.id, { is_default: false });
        }
      }
    }

    const brandProfile = await DatabaseService.createBrandProfile(brandData);
    
    res.status(201).json({
      success: true,
      data: brandProfile,
      message: 'Brand profile created successfully'
    });
  } catch (error) {
    console.error('Error creating brand profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create brand profile'
    });
  }
});

// PUT /api/brands/:id - Update a brand profile
router.put('/:id', authenticateToken, validateBrandProfile, async (req, res) => {
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

    const brandProfile = await DatabaseService.getBrandProfileById(req.params.id);
    
    if (!brandProfile) {
      return res.status(404).json({
        success: false,
        error: 'Brand profile not found'
      });
    }

    // Check ownership
    if (brandProfile.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // If this is set as default, unset other defaults
    if (req.body.is_default) {
      const userId = req.user.userId;
      const existingProfiles = await DatabaseService.getBrandProfilesByUser(userId);
      for (const profile of existingProfiles) {
        if (profile.is_default && profile.id !== req.params.id) {
          await DatabaseService.updateBrandProfile(profile.id, { is_default: false });
        }
      }
    }

    const updatedProfile = await DatabaseService.updateBrandProfile(req.params.id, req.body);
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'Brand profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update brand profile'
    });
  }
});

// DELETE /api/brands/:id - Delete a brand profile
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const brandProfile = await DatabaseService.getBrandProfileById(req.params.id);
    
    if (!brandProfile) {
      return res.status(404).json({
        success: false,
        error: 'Brand profile not found'
      });
    }

    // Check ownership
    if (brandProfile.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await DatabaseService.deleteBrandProfile(req.params.id);
    
    res.json({
      success: true,
      message: 'Brand profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete brand profile'
    });
  }
});

// POST /api/brands/:id/set-default - Set a brand profile as default
router.post('/:id/set-default', authenticateToken, async (req, res) => {
  try {
    const brandProfile = await DatabaseService.getBrandProfileById(req.params.id);
    
    if (!brandProfile) {
      return res.status(404).json({
        success: false,
        error: 'Brand profile not found'
      });
    }

    // Check ownership
    if (brandProfile.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Unset other defaults
    const userId = req.user.userId;
    const existingProfiles = await DatabaseService.getBrandProfilesByUser(userId);
    for (const profile of existingProfiles) {
      if (profile.is_default) {
        await DatabaseService.updateBrandProfile(profile.id, { is_default: false });
      }
    }

    // Set this one as default
    const updatedProfile = await DatabaseService.updateBrandProfile(req.params.id, { is_default: true });
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'Brand profile set as default successfully'
    });
  } catch (error) {
    console.error('Error setting brand profile as default:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set brand profile as default'
    });
  }
});

export default router;
