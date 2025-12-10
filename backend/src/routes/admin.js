import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { DatabaseService } from '../services/databaseService.js';
import storage from '../storage/inMemoryStorage.js';

const router = express.Router();

// Middleware to require admin access
const requireAdminAccess = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Dashboard Overview
router.get('/dashboard', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    // Get comprehensive dashboard data
    const [
      totalUsers,
      activeUsers,
      totalStoryboards,
      pendingApprovals,
      apiMetrics,
      storageMetrics,
      errorCount
    ] = await Promise.all([
      DatabaseService.getTotalUsers(),
      DatabaseService.getActiveUsers(),
      DatabaseService.getTotalStoryboards(),
      DatabaseService.getPendingApprovals(),
      DatabaseService.getApiMetrics(),
      DatabaseService.getStorageMetrics(),
      DatabaseService.getErrorCount()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalStoryboards,
        pendingApprovals,
        apiCalls: apiMetrics.totalCalls,
        storageUsed: storageMetrics.usedGB,
        errorCount
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// User Management
router.get('/users', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status, role } = req.query;
    const offset = (page - 1) * limit;

    const users = await DatabaseService.getUsers({
      offset,
      limit: parseInt(limit),
      search,
      status,
      role
    });

    const totalUsers = await DatabaseService.getTotalUsers();

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

router.get('/users/:id', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const user = await DatabaseService.getUserDetailedProfile(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Flag/Unflag user
router.post('/users/:id/flag', authenticateToken, requireAdminAccess, [
  body('reason').notEmpty().withMessage('Flag reason is required')
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

    const { reason } = req.body;
    const updatedUser = await DatabaseService.flagUser(req.params.id, reason, req.user.userId);
    
    // Log admin action
    await DatabaseService.logAdminAction(
      req.user.userId,
      req.params.id,
      'flag_user',
      { reason },
      reason
    );

    res.json({
      success: true,
      data: updatedUser,
      message: 'User flagged successfully'
    });
  } catch (error) {
    console.error('Error flagging user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flag user'
    });
  }
});

router.post('/users/:id/unflag', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const updatedUser = await DatabaseService.unflagUser(req.params.id);
    
    // Log admin action
    await DatabaseService.logAdminAction(
      req.user.userId,
      req.params.id,
      'unflag_user',
      {},
      'User unflagged by admin'
    );

    res.json({
      success: true,
      data: updatedUser,
      message: 'User unflagged successfully'
    });
  } catch (error) {
    console.error('Error unflagging user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unflag user'
    });
  }
});

// Update user status (active, inactive, banned)
router.post('/users/:id/status', authenticateToken, requireAdminAccess, [
  body('status').isIn(['active', 'inactive', 'banned']).withMessage('Invalid status'),
  body('reason').optional().isString()
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

    const { status, reason } = req.body;
    const updatedUser = await DatabaseService.updateUserStatus(req.params.id, status, reason);
    
    // Log admin action
    await DatabaseService.logAdminAction(
      req.user.userId,
      req.params.id,
      'update_user_status',
      { status, reason },
      reason || `User status changed to ${status}`
    );

    res.json({
      success: true,
      data: updatedUser,
      message: `User status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

router.put('/users/:id', authenticateToken, requireAdminAccess, [
  body('status').optional().isIn(['active', 'inactive', 'banned']),
  body('role').optional().isIn(['user', 'premium', 'admin'])
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

    const updatedUser = await DatabaseService.updateUser(req.params.id, req.body);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

router.delete('/users/:id', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const deleted = await DatabaseService.deleteUser(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Content Management
router.get('/content/storyboards', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const offset = (page - 1) * limit;

    const storyboards = await DatabaseService.getStoryboardsForAdmin({
      offset,
      limit: parseInt(limit),
      status,
      search
    });

    res.json({
      success: true,
      data: storyboards
    });
  } catch (error) {
    console.error('Error fetching storyboards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storyboards'
    });
  }
});

router.put('/content/storyboards/:id/approve', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const updated = await DatabaseService.approveStoryboard(req.params.id, {
      approvedBy: req.user.userId,
      approvedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Storyboard not found'
      });
    }

    res.json({
      success: true,
      message: 'Storyboard approved successfully'
    });
  } catch (error) {
    console.error('Error approving storyboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve storyboard'
    });
  }
});

router.put('/content/storyboards/:id/reject', authenticateToken, requireAdminAccess, [
  body('reason').notEmpty().withMessage('Rejection reason is required')
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

    const updated = await DatabaseService.rejectStoryboard(req.params.id, {
      rejectedBy: req.user.userId,
      rejectedAt: new Date().toISOString(),
      reason: req.body.reason
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Storyboard not found'
      });
    }

    res.json({
      success: true,
      message: 'Storyboard rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting storyboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject storyboard'
    });
  }
});

// System Monitoring
router.get('/monitoring/metrics', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const metrics = await DatabaseService.getSystemMetrics(timeRange);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics'
    });
  }
});

router.get('/monitoring/logs', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      level, 
      source, 
      timeRange = '24h' 
    } = req.query;
    const offset = (page - 1) * limit;

    const logs = await DatabaseService.getSystemLogs({
      offset,
      limit: parseInt(limit),
      level,
      source,
      timeRange
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system logs'
    });
  }
});

router.get('/monitoring/errors', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const errors = await DatabaseService.getErrorLogs(timeRange);
    
    res.json({
      success: true,
      data: errors
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch error logs'
    });
  }
});

// Analytics and Reporting
router.get('/analytics/users', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const analytics = await DatabaseService.getUserAnalytics(timeRange);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
});

router.get('/analytics/content', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const analytics = await DatabaseService.getContentAnalytics(timeRange);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content analytics'
    });
  }
});

router.get('/analytics/api', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const analytics = await DatabaseService.getApiAnalytics(timeRange);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching API analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API analytics'
    });
  }
});

// Bulk Operations
router.post('/bulk/users', authenticateToken, requireAdminAccess, [
  body('action').isIn(['activate', 'deactivate', 'ban', 'delete']),
  body('userIds').isArray().withMessage('User IDs must be an array')
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

    const { action, userIds } = req.body;
    const results = await DatabaseService.bulkUserAction(action, userIds);

    res.json({
      success: true,
      data: results,
      message: `Bulk ${action} completed for ${results.successful} users`
    });
  } catch (error) {
    console.error('Error performing bulk user action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk user action'
    });
  }
});

router.post('/bulk/content', authenticateToken, requireAdminAccess, [
  body('action').isIn(['approve', 'reject', 'delete']),
  body('contentIds').isArray().withMessage('Content IDs must be an array'),
  body('contentType').isIn(['storyboards', 'templates', 'characters'])
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

    const { action, contentIds, contentType } = req.body;
    const results = await DatabaseService.bulkContentAction(action, contentIds, contentType);

    res.json({
      success: true,
      data: results,
      message: `Bulk ${action} completed for ${results.successful} ${contentType}`
    });
  } catch (error) {
    console.error('Error performing bulk content action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk content action'
    });
  }
});

// Content Management Routes
router.get('/content/storyboards', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const offset = (page - 1) * limit;

    const storyboards = await DatabaseService.getAllStoryboards({
      offset,
      limit: parseInt(limit),
      search,
      status
    });

    res.json({
      success: true,
      data: storyboards
    });
  } catch (error) {
    console.error('Error fetching admin storyboards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storyboards'
    });
  }
});

router.get('/content/templates', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const templates = await DatabaseService.getAllStylingTemplates();
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching admin templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
});

router.get('/content/characters', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const characters = await DatabaseService.getAllCharacters();
    res.json({
      success: true,
      data: characters
    });
  } catch (error) {
    console.error('Error fetching admin characters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch characters'
    });
  }
});

// Public Branding Endpoint (no auth required)
router.get('/branding-public', async (req, res) => {
  try {
    // Return default branding for now
    // TODO: Implement branding storage in database
    res.json({
      success: true,
      data: {
        brandName: 'NewsPlay',
        logoUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30f8cfabb_POWEREDBYSTAIBLTECH.png',
        iconUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/010e7ad72_5.png',
        poweredByUrl: 'https://staibletech.com',
        footerText: 'Powered by StaiblTech',
        primaryFrom: '#6366f1',
        primaryTo: '#8b5cf6'
      }
    });
  } catch (error) {
    console.error('Error fetching public branding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branding'
    });
  }
});

// Protected Branding Endpoint (admin only)
router.get('/branding', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    // Return default branding for now
    // TODO: Implement branding storage in database
    res.json({
      success: true,
      data: {
        brandName: 'NewsPlay',
        logoUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30f8cfabb_POWEREDBYSTAIBLTECH.png',
        iconUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/010e7ad72_5.png',
        poweredByUrl: 'https://staibletech.com',
        footerText: 'Powered by StaiblTech',
        primaryFrom: '#6366f1',
        primaryTo: '#8b5cf6'
      }
    });
  } catch (error) {
    console.error('Error fetching branding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branding'
    });
  }
});

// Update Branding (admin only)
router.put('/branding', authenticateToken, requireAdminAccess, [
  body('brandName').optional().isString(),
  body('logoUrl').optional().isString(),
  body('iconUrl').optional().isString(),
  body('poweredByUrl').optional().isString(),
  body('footerText').optional().isString(),
  body('primaryFrom').optional().isString(),
  body('primaryTo').optional().isString()
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

    // TODO: Implement branding storage in database
    // For now, just return success
    res.json({
      success: true,
      data: req.body,
      message: 'Branding updated successfully'
    });
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branding'
    });
  }
});

export default router;
