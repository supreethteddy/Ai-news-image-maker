import DatabaseService from '../services/databaseService.js';

// Admin access middleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Check if user can access a resource (owner or admin)
export const canAccessResource = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Allow access if user is admin or owns the resource
    if (req.user.role === 'admin' || req.user.userId === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  };
};

// Check if user can access a storyboard (owner or admin)
export const canAccessStoryboard = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admin can access any storyboard
  if (req.user.role === 'admin') {
    return next();
  }

  // For non-admin users, check ownership
  try {
    const storyboardId = req.params.id;
    const storyboard = await DatabaseService.getStoryboardById(storyboardId);
    
    if (!storyboard) {
      return res.status(404).json({
        success: false,
        message: 'Storyboard not found'
      });
    }

    if (storyboard.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking storyboard access:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify access'
    });
  }
};
