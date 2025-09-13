import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import storage from '../storage/inMemoryStorage.js';

const router = express.Router();

// Get all styling templates for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = storage.getStylingTemplatesByUser(req.user.userId);
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching styling templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch styling templates'
    });
  }
});

// Get a specific styling template by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const template = storage.getStylingTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Styling template not found'
      });
    }

    // Check if template belongs to the authenticated user
    if (template.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching styling template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch styling template'
    });
  }
});

// Create a new styling template
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Template name is required'),
  body('visualStyle').notEmpty().withMessage('Visual style is required'),
  body('colorTheme').notEmpty().withMessage('Color theme is required'),
  body('logoUrl').optional().isString(),
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

    const { name, visualStyle, colorTheme, logoUrl, description } = req.body;

    const templateData = {
      name,
      visualStyle,
      colorTheme,
      logoUrl: logoUrl || null,
      description: description || '',
      userId: req.user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const template = storage.createStylingTemplate(templateData);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Styling template saved successfully'
    });
  } catch (error) {
    console.error('Error creating styling template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create styling template'
    });
  }
});

// Update a styling template
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('visualStyle').optional().notEmpty().withMessage('Visual style cannot be empty'),
  body('colorTheme').optional().notEmpty().withMessage('Color theme cannot be empty')
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

    const template = storage.getStylingTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Styling template not found'
      });
    }

    // Check if template belongs to the authenticated user
    if (template.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const updatedTemplate = storage.updateStylingTemplate(req.params.id, updateData);

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Styling template updated successfully'
    });
  } catch (error) {
    console.error('Error updating styling template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update styling template'
    });
  }
});

// Delete a styling template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const template = storage.getStylingTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Styling template not found'
      });
    }

    // Check if template belongs to the authenticated user
    if (template.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    storage.deleteStylingTemplate(req.params.id);

    res.json({
      success: true,
      message: 'Styling template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting styling template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete styling template'
    });
  }
});

export default router;
