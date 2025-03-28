import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Workspace } from '../models/Workspace';
import { User } from '../models/User';
import { logger } from '../utils/logger';

// @desc    Create new workspace
// @route   POST /api/workspaces
export const createWorkspace = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, description, icon, settings } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      icon,
      settings,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }]
    });

    return res.status(201).json(workspace);
  } catch (error) {
    logger.error('Create workspace error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all workspaces for user
// @route   GET /api/workspaces
export const getWorkspaces = async (req: Request, res: Response): Promise<Response> => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id,
      isArchived: false
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-updatedAt');

    return res.json(workspaces);
  } catch (error) {
    logger.error('Get workspaces error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single workspace
// @route   GET /api/workspaces/:id
export const getWorkspace = async (req: Request, res: Response): Promise<Response> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      'members.user': req.user._id,
      isArchived: false
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    return res.json(workspace);
  } catch (error) {
    logger.error('Get workspace error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
export const updateWorkspace = async (req: Request, res: Response): Promise<Response> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has permission to update
    const member = workspace.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ message: 'Not authorized to update workspace' });
    }

    const { name, description, icon, settings } = req.body;

    // Update fields
    if (name) workspace.name = name;
    if (description) workspace.description = description;
    if (icon) workspace.icon = icon;
    if (settings) workspace.settings = { ...workspace.settings, ...settings };

    await workspace.save();

    return res.json(workspace);
  } catch (error) {
    logger.error('Update workspace error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
export const deleteWorkspace = async (req: Request, res: Response): Promise<Response> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Soft delete by archiving
    workspace.isArchived = true;
    await workspace.save();

    return res.json({ message: 'Workspace archived successfully' });
  } catch (error) {
    logger.error('Delete workspace error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add member to workspace
// @route   POST /api/workspaces/:id/members
export const addMember = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId, role } = req.body;
    const { id } = req.params;

    const workspace = await Workspace.findOne({
      _id: id,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has permission to add members
    const currentMember = workspace.members.find(
      m => m.user.toString() === (req.user._id as Types.ObjectId).toString()
    );

    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (workspace.members.some(m => m.user.toString() === (user._id as Types.ObjectId).toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member
    workspace.members.push({
      user: user._id as Types.ObjectId,
      role: role || 'member'
    });

    await workspace.save();

    return res.json(workspace);
  } catch (error) {
    logger.error('Add member error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update member role
// @route   PUT /api/workspaces/:id/members/:userId
export const updateMemberRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { role } = req.body;
    const { id: workspaceId, userId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has permission to update roles
    const currentMember = workspace.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!currentMember || currentMember.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to update roles' });
    }

    // Find member to update
    const memberIndex = workspace.members.findIndex(
      m => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Cannot change owner's role
    if (workspace.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot change owner\'s role' });
    }

    workspace.members[memberIndex].role = role;
    await workspace.save();

    return res.json(workspace);
  } catch (error) {
    logger.error('Update member role error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:id/members/:userId
export const removeMember = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: workspaceId, userId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has permission to remove members
    const currentMember = workspace.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    // Cannot remove owner
    if (workspace.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }

    // Remove member
    workspace.members = workspace.members.filter(
      m => m.user.toString() !== userId
    );

    await workspace.save();

    return res.json(workspace);
  } catch (error) {
    logger.error('Remove member error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 