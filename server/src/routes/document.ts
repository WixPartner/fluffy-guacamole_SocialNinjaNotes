import { Router } from 'express';
import { body } from 'express-validator';
import {
  createDocument,
  getWorkspaceDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  updatePermissions
} from '../controllers/document';
import { auth } from '../middleware/auth';

const router = Router();

// @route   POST /api/documents
// @desc    Create new document
// @access  Private
router.post(
  '/',
  auth,
  [
    body('title', 'Title is required').not().isEmpty(),
    body('workspaceId', 'Workspace ID is required').not().isEmpty()
  ],
  createDocument
);

// @route   GET /api/documents/workspace/:workspaceId
// @desc    Get all documents in workspace
// @access  Private
router.get('/workspace/:workspaceId', auth, getWorkspaceDocuments);

// @route   GET /api/documents/:id
// @desc    Get single document
// @access  Private
router.get('/:id', auth, getDocument);

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private
router.put('/:id', auth, updateDocument);

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', auth, deleteDocument);

// @route   PUT /api/documents/:id/permissions
// @desc    Update document permissions
// @access  Private
router.put('/:id/permissions', auth, updatePermissions);

export default router; 