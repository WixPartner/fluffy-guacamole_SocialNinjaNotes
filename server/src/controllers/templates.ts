import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import TemplateSubscription from '../models/TemplateSubscription';

// @desc    Subscribe to template notifications
// @route   POST /api/templates/subscribe
export const subscribeToTemplates = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, name } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    // Create or update subscription
    await TemplateSubscription.findOneAndUpdate(
      { email },
      { 
        email,
        name: name || email.split('@')[0],
        userId: user?._id
      },
      { upsert: true, new: true }
    );

    // If user exists, add templateSubscribed field
    if (user) {
      user.templateSubscribed = true;
      await user.save();
    }

    // Send confirmation email
    await sendEmail({
      email,
      subject: 'Template Notification Subscription - Mentor Platform',
      message: 'Thank you for subscribing to template notifications!',
      name: name || email.split('@')[0]
    });

    return res.status(200).json({
      message: 'Successfully subscribed to template notifications',
      email
    });
  } catch (err) {
    logger.error('Template subscription error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}; 