import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { SUBSCRIPTION_FEATURES } from '../config/stripe';
import { logger } from '../utils/logger';

export const checkAiCredits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.error(`User not found for ID: ${req.user.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const maxCredits = SUBSCRIPTION_FEATURES[user.subscription.tier].aiCredits;
    const creditsUsed = user.aiCredits?.used || 0;

    // Check if we need to reset credits (monthly)
    const lastReset = user.aiCredits?.lastResetDate || new Date(0);
    const now = new Date();
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      await User.findByIdAndUpdate(user.id, {
        $set: {
          'aiCredits.used': 0,
          'aiCredits.lastResetDate': now
        }
      });
      logger.info(`Reset AI credits for user ${user.id}`);
      return next();
    }

    // Check if user has reached their limit
    if (creditsUsed >= maxCredits) {
      logger.warn(`User ${user.id} attempted to exceed AI credits limit: ${creditsUsed}/${maxCredits}`);
      return res.status(403).json({
        error: 'AI_CREDITS_LIMIT_REACHED',
        message: `AI credits limit reached. Your ${user.subscription.tier} plan allows ${maxCredits} credits per month.`,
        currentUsage: creditsUsed,
        maxAllowed: maxCredits,
        tier: user.subscription.tier,
        percentageUsed: (creditsUsed / maxCredits) * 100,
        upgradeRequired: true
      });
    }

    // Increment credits used
    await User.findByIdAndUpdate(user.id, {
      $inc: { 'aiCredits.used': 1 }
    });

    // Add usage info to response headers
    res.setHeader('X-AI-Credits-Used', creditsUsed + 1);
    res.setHeader('X-AI-Credits-Max', maxCredits);
    
    // If close to limit, add warning header
    if (creditsUsed >= maxCredits - 5) {
      res.setHeader('X-AI-Credits-Warning', `You are about to reach your AI credits limit. ${maxCredits - creditsUsed - 1} credits remaining.`);
    }

    next();
  } catch (error) {
    logger.error('Error in checkAiCredits middleware:', error);
    return res.status(500).json({
      message: 'Error checking AI credits',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 