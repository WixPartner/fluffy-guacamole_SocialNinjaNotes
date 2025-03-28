import { Router } from 'express';
import { auth } from '../middleware/auth';
import { aiService } from '../services/AIService';
import { checkAiCredits } from '../middleware/aiCredits';
import { User } from '../models/User';
import { SUBSCRIPTION_FEATURES } from '../config/stripe';
import { logger } from '../utils/logger';

const router = Router();

// @route   GET /api/ai/credits
// @desc    Get AI credits usage
// @access  Private
router.get('/credits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const maxCredits = SUBSCRIPTION_FEATURES[user.subscription.tier].aiCredits;
    const creditsUsed = user.aiCredits?.used || 0;

    return res.json({
      currentUsage: creditsUsed,
      maxAllowed: maxCredits,
      tier: user.subscription.tier,
      percentageUsed: (creditsUsed / maxCredits) * 100,
      remaining: maxCredits - creditsUsed,
      lastResetDate: user.aiCredits?.lastResetDate
    });
  } catch (error) {
    logger.error('Error fetching AI credits:', error);
    return res.status(500).json({ message: 'Error fetching AI credits' });
  }
});

// @route   POST /api/ai/generate-blocks
// @desc    Generate blocks from user prompt
// @access  Private
router.post('/generate-blocks', auth, checkAiCredits, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const blocks = await aiService.generateBlocks(prompt);
    return res.json(blocks);
  } catch (error: any) {
    logger.error('Error generating blocks:', error);
    
    // Handle specific error cases
    if (error.message === 'OPENROUTER_API_KEY environment variable is not set') {
      return res.status(500).json({ 
        message: 'Server configuration error',
        error: 'API key not configured'
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(500).json({
        message: 'Authentication error with AI service',
        error: 'Invalid API key'
      });
    }

    return res.status(500).json({ 
      message: 'Error generating blocks',
      error: error.message 
    });
  }
});

export default router; 