import jwt from 'jsonwebtoken';
import { auth } from '../lib/supabase.js';
import { DatabaseService } from '../services/databaseService.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    // Use JWT verification (our tokens are JWT, not Supabase tokens)
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Fetch user's role from database if possible
    try {
      const userProfile = await DatabaseService.getUserById(decoded.userId);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: userProfile?.role || decoded.role || 'user'
      };
    } catch (dbError) {
      console.error('Error fetching user profile:', dbError);
      // Use token data as fallback
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || 'user'
      };
    }
    
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Use JWT verification (our tokens are JWT, not Supabase tokens)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Fetch user's role from database if possible
    try {
      const userProfile = await DatabaseService.getUserById(decoded.userId);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: userProfile?.role || decoded.role || 'user'
      };
    } catch (dbError) {
      console.error('Error fetching user profile:', dbError);
      // Use token data as fallback
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || 'user'
      };
    }
    
    next();
  } catch (error) {
    console.error('Optional auth verification error:', error);
    req.user = null;
    next();
  }
};