import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { SUBSCRIPTION_FEATURES } from '../config/stripe';
import { logger } from '../utils/logger';
import { Block } from '../models/page';

/**
 * Middleware to check if a user has permission to use specific block types
 * based on their subscription tier.
 */
export const checkBlockPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only check on page creation or update
    if (req.method !== 'POST' && req.method !== 'PUT') {
      return next();
    }

    // Check if blocks are being created or updated
    if (!req.body.blocks || !Array.isArray(req.body.blocks)) {
      return next();
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      logger.error(`User not found for ID: ${req.user.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Get allowed block types for user's subscription tier
    const allowedBlockTypes = SUBSCRIPTION_FEATURES[user.subscription.tier].allowedBlockTypes;
    
    // Check if all blocks are allowed for the user's subscription tier
    const blocksToCheck: Block[] = req.body.blocks;
    const disallowedBlocks = blocksToCheck.filter(block => 
      !allowedBlockTypes.includes(block.type as any)
    );

    if (disallowedBlocks.length > 0) {
      logger.warn(`User ${user._id} attempted to use disallowed block types: ${disallowedBlocks.map(b => b.type).join(', ')}`);
      
      return res.status(403).json({
        error: 'SUBSCRIPTION_FEATURE_RESTRICTED',
        message: `Your ${user.subscription.tier} plan doesn't include access to these block types: ${disallowedBlocks.map(b => b.type).join(', ')}. Please upgrade your plan to use these features.`,
        disallowedTypes: disallowedBlocks.map(b => b.type),
        allowedTypes: allowedBlockTypes,
        tier: user.subscription.tier,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    logger.error('Error in checkBlockPermissions middleware:', error);
    return res.status(500).json({
      message: 'Error checking block permissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 