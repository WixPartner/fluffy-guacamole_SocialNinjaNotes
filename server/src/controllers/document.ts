import { Request, Response } from 'express';
import { Document} from '../models/Document';
import { Workspace } from '../models/Workspace';
import { logger } from '../utils/logger';

// @desc    Create new document
// @route   POST /api/documents
export const createDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title, content, workspaceId, parentId, type = 'document' } = req.body;

    // Check if workspace exists and user has access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or access denied' });
    }

    const document = await Document.create({
      title,
      content,
      owner: req.user._id,
      workspace: workspaceId,
      parent: parentId,
      type,
      permissions: {
        public: workspace.settings.defaultDocumentPermission === 'public',
        canEdit: [],
        canView: []
      }
    });

    return res.status(201).json(document);
  } catch (error) {
    logger.error('Create document error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all documents in workspace
// @route   GET /api/documents/workspace/:workspaceId
export const getWorkspaceDocuments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { workspaceId } = req.params;
    const { parent = null } = req.query;

    // Check workspace access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or access denied' });
    }

    // Get documents
    const documents = await Document.find({
      workspace: workspaceId,
      parent: parent || null,
      isArchived: false
    })
      .populate('owner', 'name email avatar')
      .populate('collaborators', 'name email avatar')
      .sort('-updatedAt');

    return res.json(documents);
  } catch (error) {
    logger.error('Get workspace documents error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
export const getDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('collaborators', 'name email avatar')
      .populate('children');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      'members.user': req.user._id
    });

    const hasAccess =
      document.permissions.public ||
      document.owner.toString() === req.user._id.toString() ||
      document.collaborators.some(c => c._id.toString() === req.user._id.toString()) ||
      workspace !== null;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(document);
  } catch (error) {
    logger.error('Get document error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
export const updateDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check edit permissions
    const canEdit =
      document.owner.toString() === req.user._id.toString() ||
      document.permissions.canEdit.includes(req.user._id);

    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update version on content change
    if (req.body.content) {
      document.version += 1;
    }

    // Update document
    Object.assign(document, req.body);
    await document.save();

    return res.json(document);
  } catch (error) {
    logger.error('Update document error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
export const deleteDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only owner can delete
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete by archiving
    document.isArchived = true;
    await document.save();

    return res.json({ message: 'Document archived successfully' });
  } catch (error) {
    logger.error('Delete document error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update document permissions
// @route   PUT /api/documents/:id/permissions
export const updatePermissions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only owner can update permissions
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { public: isPublic, canEdit, canView } = req.body;

    document.permissions = {
      public: isPublic,
      canEdit: canEdit || [],
      canView: canView || []
    };

    await document.save();

    return res.json(document);
  } catch (error) {
    logger.error('Update permissions error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 