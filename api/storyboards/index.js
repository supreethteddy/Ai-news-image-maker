// Storyboards endpoint
const jwt = require('jsonwebtoken');

// In-memory storage for demo (replace with your database)
const users = new Map();
const storyboards = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

function authenticateToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Access token required' };
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return { user };
  } catch (err) {
    return { error: 'Invalid or expired token' };
  }
}

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Authenticate user
  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(401).json({
      success: false,
      message: auth.error
    });
  }

  if (req.method === 'GET') {
    // Get user's storyboards
    const userStoryboards = Array.from(storyboards.values())
      .filter(story => story.userId === auth.user.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.status(200).json({
      success: true,
      storyboards: userStoryboards
    });
  }

  if (req.method === 'POST') {
    try {
      const { title, description, images } = req.body;

      // Basic validation
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      // Check user credits
      const user = Array.from(users.values()).find(u => u.id === auth.user.userId);
      if (!user || user.credits < 1) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient credits'
        });
      }

      // Create storyboard
      const storyId = Date.now().toString();
      const storyboard = {
        id: storyId,
        userId: auth.user.userId,
        title,
        description: description || '',
        images: images || [],
        createdAt: new Date().toISOString()
      };
      
      storyboards.set(storyId, storyboard);
      
      // Deduct credit
      user.credits = Math.max(0, user.credits - 1);
      
      return res.status(201).json({
        success: true,
        message: 'Storyboard created successfully',
        storyboard
      });
    } catch (error) {
      console.error('Storyboard creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create storyboard'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
