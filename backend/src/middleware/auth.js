import jwt from 'jsonwebtoken';
import { auth } from '../lib/supabase.js';

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
    // First try Supabase token verification
    const { user, error } = await auth.verifyToken(token);
    
    if (user && !error) {
      req.user = {
        userId: user.id,
        email: user.email,
        supabaseUser: user
      };
      return next();
    }

    // Fallback to JWT verification for backward compatibility
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      req.user = user;
      next();
    });
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
    // First try Supabase token verification
    const { user, error } = await auth.verifyToken(token);
    
    if (user && !error) {
      req.user = {
        userId: user.id,
        email: user.email,
        supabaseUser: user
      };
      return next();
    }

    // Fallback to JWT verification for backward compatibility
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  } catch (error) {
    console.error('Optional auth verification error:', error);
    req.user = null;
    next();
  }
};