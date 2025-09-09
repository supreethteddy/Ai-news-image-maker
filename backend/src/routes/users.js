import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, generateToken, hashPassword, comparePassword } from '../middleware/auth.js';
import storage from '../storage/inMemoryStorage.js';

const router = express.Router();

// Validation middleware
const validateUserRegistration = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
];

const validateUserLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// POST /api/users/register - Register a new user
router.post('/register', validateUserRegistration, async (req, res) => {
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

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData = {
      email,
      password_hash: hashedPassword,
      name
    };

    const user = storage.createUser(userData);

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
});

// POST /api/users/login - Login user
router.post('/login', validateUserLogin, async (req, res) => {
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

    const { email, password } = req.body;

    // Find user by email
    const user = storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login user'
    });
  }
});

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = storage.getUser(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// PUT /api/users/profile - Update current user profile
router.put('/profile', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
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

    const { name, email } = req.body;
    const userId = req.user.userId;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = storage.updateUser(userId, updateData);

    // Remove password from response
    const { password_hash, ...userResponse } = updatedUser;

    res.json({
      success: true,
      data: userResponse,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// POST /api/users/change-password - Change user password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    storage.updateUser(userId, { password_hash: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// DELETE /api/users/profile - Delete user account
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Delete user's stories
    const userStories = storage.listStories(userId);
    userStories.forEach(story => {
      storage.deleteStory(story.id);
    });

    // Delete user's brand profiles
    const userBrandProfiles = storage.listBrandProfiles(userId);
    userBrandProfiles.forEach(profile => {
      storage.deleteBrandProfile(profile.id);
    });

    // Delete user
    storage.deleteUser(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

// GET /api/users/stats - Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const stories = storage.listStories(userId);
    const brandProfiles = storage.listBrandProfiles(userId);
    
    const stats = {
      total_stories: stories.length,
      completed_stories: stories.filter(s => s.status === 'completed').length,
      processing_stories: stories.filter(s => s.status === 'processing').length,
      failed_stories: stories.filter(s => s.status === 'failed').length,
      total_brand_profiles: brandProfiles.length,
      default_brand_profile: brandProfiles.find(p => p.is_default)?.id || null
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

export default router;
