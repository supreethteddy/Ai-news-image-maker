import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import DatabaseService from '../services/databaseService.js';

const router = express.Router();

// Get user's current credit balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const credits = await DatabaseService.getUserCredits(req.user.userId);
    res.json({
      success: true,
      credits
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credit balance'
    });
  }
});

// Get user's credit transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const transactions = await DatabaseService.getCreditTransactions(req.user.userId, {
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: transactions.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credit transactions'
    });
  }
});

// Admin route: Add credits to a user
router.post('/add', authenticateToken, [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    // Check if user is admin
    const userProfile = await DatabaseService.getUserProfile(req.user.userId);
    if (!userProfile || userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, amount, description = 'Admin credit bonus' } = req.body;

    await DatabaseService.addCredits(userId, amount, description, req.user.userId);
    
    const newBalance = await DatabaseService.getUserCredits(userId);
    
    res.json({
      success: true,
      message: `Added ${amount} credit(s) to user`,
      newBalance
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add credits'
    });
  }
});

// Admin route: Get all credit transactions
router.get('/admin/transactions', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userProfile = await DatabaseService.getUserProfile(req.user.userId);
    if (!userProfile || userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 50, userId } = req.query;
    const offset = (page - 1) * limit;
    
    const transactions = await DatabaseService.getAllCreditTransactions({
      offset: parseInt(offset),
      limit: parseInt(limit),
      userId
    });
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: transactions.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin credit transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credit transactions'
    });
  }
});

// Check if user has sufficient credits for an operation
router.post('/check', authenticateToken, [
  body('requiredCredits').isInt({ min: 1 }).withMessage('Required credits must be a positive integer')
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

    const { requiredCredits } = req.body;
    const hasCredits = await DatabaseService.checkUserCredits(req.user.userId, requiredCredits);
    const currentCredits = await DatabaseService.getUserCredits(req.user.userId);
    
    res.json({
      success: true,
      hasCredits,
      currentCredits,
      requiredCredits
    });
  } catch (error) {
    console.error('Error checking credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check credits'
    });
  }
});

// Get available credit packages
router.get('/packages', async (req, res) => {
  try {
    const packages = await DatabaseService.getCreditPackages();
    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credit packages'
    });
  }
});

// Purchase credits (DEMO: instant purchase - replace with Stripe/PayPal in production)
router.post('/purchase', authenticateToken, [
  body('packageId').isUUID().withMessage('Valid package ID is required'),
  body('paymentMethod').optional().isString().withMessage('Payment method must be a string')
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

    const { packageId, paymentMethod = 'demo' } = req.body;
    
    // Generate a demo payment ID (replace with real payment processor ID in production)
    const demoPaymentId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const purchaseId = await DatabaseService.processCreditPurchase(
      req.user.userId, 
      packageId, 
      paymentMethod, 
      demoPaymentId
    );
    
    const newBalance = await DatabaseService.getUserCredits(req.user.userId);
    
    res.json({
      success: true,
      message: 'Credits purchased successfully!',
      purchaseId,
      newBalance
    });
  } catch (error) {
    console.error('Error purchasing credits:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to purchase credits'
    });
  }
});

// Get user's purchase history
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const purchases = await DatabaseService.getCreditPurchaseHistory(req.user.userId, {
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: purchases.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase history'
    });
  }
});

// Check if user should see credit warning
router.get('/warning', authenticateToken, async (req, res) => {
  try {
    const { threshold = 3 } = req.query;
    const shouldWarn = await DatabaseService.shouldShowCreditWarning(req.user.userId, parseInt(threshold));
    const currentCredits = await DatabaseService.getUserCredits(req.user.userId);
    
    res.json({
      success: true,
      shouldWarn,
      currentCredits,
      threshold: parseInt(threshold)
    });
  } catch (error) {
    console.error('Error checking credit warning:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check credit warning'
    });
  }
});

// Admin route: Get all credit purchases
router.get('/admin/purchases', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userProfile = await DatabaseService.getUserProfile(req.user.userId);
    if (!userProfile || userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 50, userId } = req.query;
    const offset = (page - 1) * limit;
    
    const purchases = await DatabaseService.getAllCreditPurchases({
      offset: parseInt(offset),
      limit: parseInt(limit),
      userId
    });
    
    res.json({
      success: true,
      data: purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: purchases.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin purchase history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase history'
    });
  }
});

export default router;
