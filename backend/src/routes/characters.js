import express from 'express';
import { body, validationResult } from 'express-validator';
import storage from '../storage/inMemoryStorage.js';
import axios from 'axios';

const router = express.Router();

// Get all characters
router.get('/', async (req, res) => {
  try {
    const characters = storage.getCharactersByUser('demo-user');
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
router.get('/:id', async (req, res) => {
  try {
    const character = storage.getCharacterById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
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
router.post('/', [
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
      userId: 'demo-user',
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
router.put('/:id', [
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
router.delete('/:id', async (req, res) => {
  try {
    const character = storage.getCharacterById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
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
router.post('/generate', [
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

    const characterData = {
      name,
      description,
      imagePrompt,
      source: 'generated',
      userId: 'demo-user',
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

// Generate character image using Ideogram API
router.post('/generate-image', [
  body('prompt').notEmpty().withMessage('Character prompt is required'),
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

    const { prompt, name, style = 'realistic' } = req.body;

    // Enhanced prompt for character generation
    const enhancedPrompt = `A ${style} portrait of ${name}: ${prompt}. Professional photography, high quality, detailed facial features, consistent character design, clean background.`;

    console.log('Generating character image with prompt:', enhancedPrompt);

    // Call Ideogram API
    const ideogramResponse = await axios.post('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      prompt: enhancedPrompt,
      rendering_speed: 'TURBO',
      num_images: 1
    }, {
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (ideogramResponse.data && ideogramResponse.data.data && ideogramResponse.data.data[0]) {
      const imageData = ideogramResponse.data.data[0];
      
      // Create character with generated image
      const characterData = {
        name,
        description: prompt,
        imageUrl: imageData.url,
        imagePrompt: enhancedPrompt,
        source: 'generated',
        userId: 'demo-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const character = storage.createCharacter(characterData);

      res.status(201).json({
        success: true,
        data: character,
        message: 'Character generated successfully'
      });
    } else {
      throw new Error('Invalid response from Ideogram API');
    }
  } catch (error) {
    console.error('Error generating character image:', error);
    
    // Fallback: create character without image
    const characterData = {
      name: req.body.name,
      description: req.body.prompt,
      imagePrompt: req.body.prompt,
      source: 'generated',
      userId: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const character = storage.createCharacter(characterData);

    res.status(201).json({
      success: true,
      data: character,
      message: 'Character created (image generation failed)',
      warning: 'Image generation failed, but character was saved'
    });
  }
});

export default router;
