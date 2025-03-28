import { Router } from 'express';
import { body } from 'express-validator';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  updateMemberRole,
  removeMember
} from '../controllers/workspace';
import { auth } from '../middleware/auth';

const router = Router();

// @route   POST /api/workspaces
// @desc    Create new workspace
// @access  Private
router.post(
  '/',
  auth,
  [
    body('name', 'Name is required').not().isEmpty(),
    body('name', 'Name cannot exceed 50 characters').isLength({ max: 50 })
  ],
  createWorkspace
);

// @route   GET /api/workspaces
// @desc    Get all workspaces for user
// @access  Private
router.get('/', auth, getWorkspaces);

// @route   GET /api/workspaces/:id
// @desc    Get single workspace
// @access  Private
router.get('/:id', auth, getWorkspace);

// @route   PUT /api/workspaces/:id
// @desc    Update workspace
// @access  Private
router.put(
  '/:id',
  auth,
  [
    body('name', 'Name cannot exceed 50 characters').optional().isLength({ max: 50 }),
    body('description', 'Description cannot exceed 500 characters').optional().isLength({ max: 500 })
  ],
  updateWorkspace
);

// @route   DELETE /api/workspaces/:id
// @desc    Delete workspace
// @access  Private
router.delete('/:id', auth, deleteWorkspace);

// @route   POST /api/workspaces/:id/members
// @desc    Add member to workspace
// @access  Private
router.post(
  '/:id/members',
  auth,
  [
    body('email', 'Valid email is required').isEmail(),
    body('role', 'Invalid role').optional().isIn(['admin', 'member', 'viewer'])
  ],
  addMember
);

// @route   PUT /api/workspaces/:id/members/:userId
// @desc    Update member role
// @access  Private
router.put(
  '/:id/members/:userId',
  auth,
  [body('role', 'Valid role is required').isIn(['admin', 'member', 'viewer'])],
  updateMemberRole
);

// @route   DELETE /api/workspaces/:id/members/:userId
// @desc    Remove member from workspace
// @access  Private
router.delete('/:id/members/:userId', auth, removeMember);

export default router; 