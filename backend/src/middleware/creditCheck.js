import DatabaseService from '../services/databaseService.js';

/**
 * Middleware to check if user has sufficient credits for an operation
 * @param {number} requiredCredits - Number of credits required (default: 1)
 * @returns {Function} Express middleware function
 */
export const checkCredits = (requiredCredits = 1) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Check if user has sufficient credits
      const hasCredits = await DatabaseService.checkUserCredits(userId, requiredCredits);
      
      if (!hasCredits) {
        const currentCredits = await DatabaseService.getUserCredits(userId);
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          message: `You need ${requiredCredits} credit(s) but only have ${currentCredits}. Please purchase more credits to continue.`,
          currentCredits,
          requiredCredits
        });
      }

      // Store required credits in request for later use
      req.requiredCredits = requiredCredits;
      next();
    } catch (error) {
      console.error('Credit check middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check credits',
        message: 'An error occurred while checking your credit balance'
      });
    }
  };
};

/**
 * Middleware to deduct credits after successful operation
 * Should be used after the main operation completes successfully
 * @param {string} description - Description for the transaction
 * @param {Function} getReferenceId - Function to get reference ID from request/response
 * @returns {Function} Express middleware function
 */
export const deductCredits = (description = 'Storyboard generation', getReferenceId = null) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const requiredCredits = req.requiredCredits || 1;
      
      if (!userId) {
        return next();
      }

      // Get reference ID if function provided
      let referenceId = null;
      if (getReferenceId && typeof getReferenceId === 'function') {
        referenceId = getReferenceId(req, res);
      }

      // Deduct credits
      await DatabaseService.deductCredits(
        userId, 
        requiredCredits, 
        description, 
        referenceId
      );

      console.log(`Deducted ${requiredCredits} credit(s) from user ${userId} for: ${description}`);
      next();
    } catch (error) {
      console.error('Credit deduction error:', error);
      // Don't fail the request if credit deduction fails
      // Log the error and continue
      console.error(`Failed to deduct credits for user ${req.user?.userId}: ${error.message}`);
      next();
    }
  };
};

/**
 * Middleware to add user's current credit balance to response
 */
export const addCreditBalance = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (userId) {
      const credits = await DatabaseService.getUserCredits(userId);
      
      // Add credits to response locals so it can be included in response
      res.locals.userCredits = credits;
    }
    
    next();
  } catch (error) {
    console.error('Add credit balance middleware error:', error);
    // Don't fail the request, just continue without credit info
    next();
  }
};

/**
 * Helper function to include credits in JSON response
 */
export const includeCreditsInResponse = (originalJson) => {
  return function(body) {
    if (this.locals.userCredits !== undefined) {
      if (typeof body === 'object' && body !== null) {
        body.userCredits = this.locals.userCredits;
      }
    }
    return originalJson.call(this, body);
  };
};

export default {
  checkCredits,
  deductCredits,
  addCreditBalance,
  includeCreditsInResponse
};
