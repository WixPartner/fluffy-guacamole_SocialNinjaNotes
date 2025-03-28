import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Page } from '../models/page';
import { SUBSCRIPTION_FEATURES } from '../config/stripe';
import { logger } from '../utils/logger';

export const checkPageLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only check on page creation
    if (req.method !== 'POST') {
      return next();
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      logger.error(`User not found for ID: ${req.user.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current page count (excluding deleted pages)
    const currentPageCount = await Page.countDocuments({ 
      userId: req.user.id, 
      isDeleted: false 
    });

    // Get max pages allowed for user's subscription tier
    const maxPages = SUBSCRIPTION_FEATURES[user.subscription.tier].maxPages;
    logger.info(`User ${user._id} page count: ${currentPageCount}/${maxPages} (${user.subscription.tier} tier)`);

    // Check if creating a new page would exceed the limit
    if (currentPageCount >= maxPages) {
      logger.warn(`User ${user._id} attempted to exceed page limit: ${currentPageCount}/${maxPages}`);
      return res.status(403).json({ 
        error: 'SUBSCRIPTION_LIMIT_REACHED',
        message: `Page limit reached. Your ${user.subscription.tier} plan allows ${maxPages} pages. Please upgrade to create more pages.`,
        currentCount: currentPageCount,
        maxAllowed: maxPages,
        tier: user.subscription.tier,
        percentageUsed: (currentPageCount / maxPages) * 100,
        upgradeRequired: true
      });
    }

    // If close to limit, add warning header
    if (currentPageCount >= maxPages - 1) {
      res.setHeader('X-Subscription-Warning', `You are about to reach your page limit. ${maxPages - currentPageCount} pages remaining.`);
    }

    next();
  } catch (error) {
    logger.error('Error in checkPageLimit middleware:', error);
    return res.status(500).json({ 
      message: 'Error checking subscription limits',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 