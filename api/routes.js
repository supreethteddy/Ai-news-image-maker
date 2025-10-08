// CommonJS routes for Vercel deployment
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// In-memory storage for demo (replace with your database)
const users = new Map();
const stories = new Map();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Auth routes
router.post('/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim()
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

    const { email, password, name } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    
    users.set(email, {
      id: userId,
      email,
      password: hashedPassword,
      name,
      credits: 10, // Free credits for new users
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        credits: 10
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

router.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
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

    const { email, password } = req.body;
    const user = users.get(email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Profile route
router.get('/auth/profile', authenticateToken, (req, res) => {
  const user = Array.from(users.values()).find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      credits: user.credits
    }
  });
});

// Credits routes
router.get('/credits/balance', authenticateToken, (req, res) => {
  const user = Array.from(users.values()).find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    credits: {
      balance: user.credits,
      userId: user.id
    }
  });
});

// Storyboard routes
router.post('/storyboards', authenticateToken, (req, res) => {
  try {
    const { title, description, images } = req.body;
    const storyId = Date.now().toString();
    
    const storyboard = {
      id: storyId,
      userId: req.user.userId,
      title,
      description,
      images: images || [],
      createdAt: new Date().toISOString()
    };
    
    stories.set(storyId, storyboard);
    
    // Deduct credit
    const user = Array.from(users.values()).find(u => u.id === req.user.userId);
    if (user) {
      user.credits = Math.max(0, user.credits - 1);
    }
    
    res.json({
      success: true,
      message: 'Storyboard created successfully',
      storyboard
    });
  } catch (error) {
    console.error('Storyboard creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create storyboard'
    });
  }
});

router.get('/storyboards', authenticateToken, (req, res) => {
  try {
    const userStories = Array.from(stories.values())
      .filter(story => story.userId === req.user.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      storyboards: userStories
    });
  } catch (error) {
    console.error('Error fetching storyboards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storyboards'
    });
  }
});

// AI routes (placeholder)
router.post('/ai/generate-image', authenticateToken, (req, res) => {
  // This would integrate with your AI service
  res.json({
    success: true,
    message: 'AI image generation endpoint',
    imageUrl: 'https://via.placeholder.com/400x300?text=AI+Generated+Image'
  });
});

module.exports = router;
