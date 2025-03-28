import { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';

const router = Router();

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, (req: Request, res: Response) => {
  res.json(req.user);
});

export default router; 