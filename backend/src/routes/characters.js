import express from 'express';
import { body, validationResult } from 'express-validator';
import storage from '../storage/inMemoryStorage.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all characters for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const characters = storage.getCharactersByUser(req.user.userId);
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

// Get a specific character by ID (must belong to user)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const character = storage.getCharacterById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character belongs to the authenticated user
    if (character.userId !== req.user.userId) {
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
      userId: req.user.userId,
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

    // Check if character belongs to the authenticated user
    if (character.userId !== req.user.userId) {
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

    // Check if character belongs to the authenticated user
    if (character.userId !== req.user.userId) {
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

    const characterData = {
      name,
      description,
      imagePrompt,
      source: 'generated',
      userId: req.user.userId,
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

// Generate character image using Ideogram API with character reference
router.post('/generate-image', authenticateToken, [
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

    const { prompt, name, style = 'realistic', imageUrl } = req.body;

    // Enhanced prompt for character generation
    let enhancedPrompt;
    if (imageUrl) {
      // When using face reference, focus on scene/setting rather than face description
      enhancedPrompt = `${prompt}. Professional photography, high quality, consistent character design, clean background.`;
    } else {
      // When no face reference, include facial features in prompt
      enhancedPrompt = `${prompt}. Professional photography, high quality, detailed facial features, consistent character design.`;
    }

    console.log('Generating character image with prompt:', enhancedPrompt);

    // Prepare the request data
    const requestData = {
      prompt: enhancedPrompt,
      rendering_speed: 'TURBO',
      num_images: 1,
      style_type: style.toUpperCase()
    };

    // If we have an image URL, obtain it (local disk for /uploads, otherwise HTTP)
    let characterReferenceBuffer = null;
    if (imageUrl) {
      try {
        if (imageUrl.startsWith('/uploads/')) {
          const relativePath = imageUrl.replace('/uploads/', '');
          const absolutePath = path.join(__dirname, '../../uploads', relativePath);
          console.log('Reading character reference image from disk:', absolutePath);
          const fileData = await fs.readFile(absolutePath);
          characterReferenceBuffer = Buffer.from(fileData);
          console.log('Character reference image loaded from disk successfully');
        } else if (imageUrl.startsWith('http://localhost:3001/uploads/')) {
          const relativePath = imageUrl.replace('http://localhost:3001/uploads/', '');
          const absolutePath = path.join(__dirname, '../../uploads', relativePath);
          console.log('Reading character reference image from disk:', absolutePath);
          const fileData = await fs.readFile(absolutePath);
          characterReferenceBuffer = Buffer.from(fileData);
          console.log('Character reference image loaded from disk successfully');
        } else {
          console.log('Downloading character reference image:', imageUrl);
          const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 15000
          });
          characterReferenceBuffer = Buffer.from(imageResponse.data);
          console.log('Character reference image downloaded successfully');
        }
      } catch (error) {
        console.error('Error obtaining character reference image:', error);
        // Continue without character reference if download fails
      }
    }

    // Call Ideogram API
    let ideogramResponse;
    if (characterReferenceBuffer) {
      // Use FormData for file upload
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      
      formData.append('prompt', enhancedPrompt);
      formData.append('rendering_speed', 'TURBO');
      formData.append('num_images', '1');
      formData.append('style_type', style.toUpperCase());
      formData.append('character_reference_images', characterReferenceBuffer, {
        filename: 'character_reference.jpg',
        contentType: 'image/jpeg'
      });

      console.log('Calling Ideogram API with character reference image');
      ideogramResponse = await axios.post('https://api.ideogram.ai/v1/ideogram-v3/generate', formData, {
        headers: {
          'Api-Key': process.env.IDEOGRAM_API_KEY,
          ...formData.getHeaders()
        },
        timeout: 30000
      });
    } else {
      // Fallback to JSON request without character reference
      console.log('Calling Ideogram API without character reference');
      ideogramResponse = await axios.post('https://api.ideogram.ai/v1/ideogram-v3/generate', requestData, {
        headers: {
          'Api-Key': process.env.IDEOGRAM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
    }

    if (ideogramResponse.data && ideogramResponse.data.data && ideogramResponse.data.data[0]) {
      const imageData = ideogramResponse.data.data[0];
      
      // Create character with generated image
      const characterData = {
        name,
        description: prompt,
        imageUrl: imageData.url,
        // Persist the original face reference if provided so future generations can reuse it
        referenceImageUrl: imageUrl || null,
        imagePrompt: enhancedPrompt,
        source: characterReferenceBuffer ? 'upload' : 'generated',
        userId: req.user.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const character = storage.createCharacter(characterData);

      res.status(201).json({
        success: true,
        data: character,
        message: 'Character generated successfully with reference image'
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
      referenceImageUrl: req.body.imageUrl || null,
      source: 'generated',
      userId: req.user.userId,
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

// Download character image proxy endpoint
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const character = storage.getCharacterById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character belongs to the authenticated user
    if (character.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!character.imageUrl) {
      return res.status(404).json({
        success: false,
        message: 'Character has no image'
      });
    }

    // Download the image from the external URL
    const imageResponse = await axios.get(character.imageUrl, {
      responseType: 'stream',
      timeout: 30000
    });

    // Set appropriate headers for download
    res.setHeader('Content-Type', imageResponse.headers['content-type'] || 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${character.name}-character-image.jpg"`);
    
    // Pipe the image stream to the response
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error('Error downloading character image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download image'
    });
  }
});

export default router;
