import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import storageService from '../services/storageService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/characters';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'character-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Strict validation: Only WEBP, PNG, JPEG allowed
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    const extname = path.extname(file.originalname).toLowerCase();
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.includes(extname);

    if (isValidMimeType && isValidExtension) {
      return cb(null, true);
    } else {
      cb(new Error('The image was not provided in one of supported formats (WEBP, PNG, JPEG)'));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  } else if (error.message && error.message.includes('supported formats')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next(error);
};

// Upload character image
router.post('/character-image', authenticateToken, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided or file format not supported. Please use WEBP, PNG, or JPEG format.'
      });
    }

    // Upload to Supabase Storage
    console.log('📤 Uploading character image to Supabase Storage...');
    const uploadResult = await storageService.uploadUserFile(
      req.file.path,
      req.user.userId,
      req.file.originalname,
      'character-uploads'
    );

    let finalImageUrl = `/uploads/characters/${req.file.filename}`; // Fallback to local URL
    
    if (uploadResult.success) {
      console.log('✅ Character image uploaded to Supabase Storage:', uploadResult.publicUrl);
      finalImageUrl = uploadResult.publicUrl;
      
      // Clean up local file after successful upload
      try {
        await fs.unlink(req.file.path);
        console.log('🗑️ Local file cleaned up:', req.file.path);
      } catch (cleanupError) {
        console.log('⚠️ Failed to clean up local file:', cleanupError.message);
      }
    } else {
      console.log('⚠️ Failed to upload to Supabase Storage, keeping local file:', uploadResult.error);
    }
    
    res.json({
      success: true,
      data: {
        imageUrl: finalImageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        storageType: uploadResult.success ? 'supabase' : 'local'
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Handle multer validation errors
    if (error.message && error.message.includes('supported formats')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// Upload logo for styling templates
router.post('/logo', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided'
      });
    }

    // Upload to Supabase Storage
    console.log('📤 Uploading logo to Supabase Storage...');
    const uploadResult = await storageService.uploadUserFile(
      req.file.path,
      req.user.userId,
      req.file.originalname,
      'logo-uploads'
    );

    let finalImageUrl = `/uploads/characters/${req.file.filename}`; // Fallback to local URL
    
    if (uploadResult.success) {
      console.log('✅ Logo uploaded to Supabase Storage:', uploadResult.publicUrl);
      finalImageUrl = uploadResult.publicUrl;
      
      // Clean up local file after successful upload
      try {
        await fs.unlink(req.file.path);
        console.log('🗑️ Local file cleaned up:', req.file.path);
      } catch (cleanupError) {
        console.log('⚠️ Failed to clean up local file:', cleanupError.message);
      }
    } else {
      console.log('⚠️ Failed to upload to Supabase Storage, keeping local file:', uploadResult.error);
    }
    
    res.json({
      success: true,
      data: {
        logoUrl: finalImageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        storageType: uploadResult.success ? 'supabase' : 'local'
      },
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo'
    });
  }
});

// Serve uploaded images
router.use('/uploads', express.static('uploads'));

export default router;
