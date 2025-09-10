import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import storage from '../storage/inMemoryStorage.js';

const router = express.Router();

// Get all characters for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const characters = storage.getCharactersByUser(req.user.id);
    res.json({
      success: true,
      data: characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch characters'
    });
  }
});

// Get a specific character by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const character = storage.getCharacterById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character belongs to user
    if (character.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch character'
    });
  }
});

// Create a new character
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Character name is required'),
  body('description').optional().isString(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('imagePrompt').optional().isString(),
  body('personality').optional().isString(),
  body('appearance').optional().isString(),
  body('source').optional().isIn(['upload', 'generated', 'camera']).withMessage('Invalid source type')
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

    const characterData = {
      ...req.body,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const character = storage.createCharacter(characterData);

    res.status(201).json({
      success: true,
      data: character,
      message: 'Character created successfully'
    });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create character'
    });
  }
});

// Update a character
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Character name cannot be empty'),
  body('description').optional().isString(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('imagePrompt').optional().isString(),
  body('personality').optional().isString(),
  body('appearance').optional().isString()
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

    const character = storage.getCharacterById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character belongs to user
    if (character.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const updatedCharacter = storage.updateCharacter(req.params.id, updateData);

    res.json({
      success: true,
      data: updatedCharacter,
      message: 'Character updated successfully'
    });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update character'
    });
  }
});

// Delete a character
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const character = storage.getCharacterById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character belongs to user
    if (character.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    storage.deleteCharacter(req.params.id);

    res.json({
      success: true,
      message: 'Character deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete character'
    });
  }
});

// Generate character from description
router.post('/generate', authenticateToken, [
  body('description').notEmpty().withMessage('Character description is required'),
  body('name').notEmpty().withMessage('Character name is required'),
  body('style').optional().isString()
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

    const { description, name, style = 'realistic' } = req.body;

    // Generate image prompt for the character
    const imagePrompt = `A ${style} portrait of ${name}: ${description}. Professional photography, high quality, detailed facial features, consistent character design.`;

    // For now, we'll return the prompt. In a real implementation, you'd call the AI service
    // to generate the actual image
    const characterData = {
      name,
      description,
      imagePrompt,
      source: 'generated',
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const character = storage.createCharacter(characterData);

    res.status(201).json({
      success: true,
      data: character,
      message: 'Character generated successfully'
    });
  } catch (error) {
    console.error('Error generating character:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate character'
    });
  }
});

export default router;
