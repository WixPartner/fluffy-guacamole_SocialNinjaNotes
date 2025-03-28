import { Router } from 'express';
import { body } from 'express-validator';
import { subscribeToTemplates } from '../controllers/templates';

const router = Router();

// @route   POST /api/templates/subscribe
// @desc    Subscribe to template notifications
// @access  Public
router.post(
  '/subscribe',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('name', 'Name must be a string').optional().isString()
  ],
  subscribeToTemplates
);

export default router; 