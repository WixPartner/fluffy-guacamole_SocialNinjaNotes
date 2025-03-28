import { Types } from 'mongoose';
import { PageSharing, PermissionLevel, IShareSetting } from '../models/ShareSettings';
import { ChangeHistory, ChangeType } from '../models/ChangeHistory';

export class PermissionService {
  /**
   * Check if a user has the required permission level for a page
   */
  public async hasPermission(
    pageId: Types.ObjectId,
    userId: Types.ObjectId,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const sharing = await PageSharing.findOne({ pageId });
    if (!sharing) return false;

    // Check if page is public and required level is VIEWER
    if (sharing.isPublic && requiredLevel === PermissionLevel.VIEWER) {
      return true;
    }

    // Find user's permission setting
    const userSetting = sharing.shareSettings.find(
      setting => setting.userId.equals(userId)
    );

    if (!userSetting) return false;

    // Permission hierarchy
    const permissionHierarchy = {
      [PermissionLevel.VIEWER]: 0,
      [PermissionLevel.COMMENTER]: 1,
      [PermissionLevel.EDITOR]: 2,
      [PermissionLevel.ADMIN]: 3
    };

    return permissionHierarchy[userSetting.permissionLevel] >= permissionHierarchy[requiredLevel];
  }

  /**
   * Grant permission to a user for a page
   */
  public async grantPermission(
    pageId: Types.ObjectId,
    userId: Types.ObjectId,
    permissionLevel: PermissionLevel,
    grantedBy: Types.ObjectId
  ): Promise<IShareSetting | null> {
    // Check if granter has admin permission
    const hasAdminPermission = await this.hasPermission(
      pageId,
      grantedBy,
      PermissionLevel.ADMIN
    );

    if (!hasAdminPermission) {
      throw new Error('Insufficient permissions to grant access');
    }

    const sharing = await PageSharing.findOne({ pageId });
    if (!sharing) {
      throw new Error('Page not found');
    }

    // Remove existing permission if any
    const existingIndex = sharing.shareSettings.findIndex(
      setting => setting.userId.equals(userId)
    );
    
    if (existingIndex !== -1) {
      sharing.shareSettings.splice(existingIndex, 1);
    }

    // Create new permission
    const newSetting = {
      pageId,
      userId,
      permissionLevel,
      addedBy: grantedBy,
      addedAt: new Date(),
      lastModified: new Date()
    } as IShareSetting;

    // Add new permission
    sharing.shareSettings.push(newSetting);
    await sharing.save();

    // Record in change history
    await ChangeHistory.create({
      pageId,
      userId: grantedBy,
      type: ChangeType.PERMISSION,
      timestamp: new Date(),
      metadata: {
        permission: {
          userId,
          oldLevel: null,
          newLevel: permissionLevel
        }
      }
    });

    return newSetting;
  }

  /**
   * Revoke permission from a user for a page
   */
  public async revokePermission(
    pageId: Types.ObjectId,
    userId: Types.ObjectId,
    revokedBy: Types.ObjectId
  ): Promise<boolean> {
    // Check if revoker has admin permission
    const hasAdminPermission = await this.hasPermission(
      pageId,
      revokedBy,
      PermissionLevel.ADMIN
    );

    if (!hasAdminPermission) {
      throw new Error('Insufficient permissions to revoke access');
    }

    const sharing = await PageSharing.findOne({ pageId });
    if (!sharing) {
      throw new Error('Page not found');
    }

    // Find existing permission
    const existingIndex = sharing.shareSettings.findIndex(
      setting => setting.userId.equals(userId)
    );

    if (existingIndex === -1) {
      return false;
    }

    const oldLevel = sharing.shareSettings[existingIndex].permissionLevel;

    // Remove permission
    sharing.shareSettings.splice(existingIndex, 1);
    await sharing.save();

    // Record in change history
    await ChangeHistory.create({
      pageId,
      userId: revokedBy,
      type: ChangeType.PERMISSION,
      timestamp: new Date(),
      metadata: {
        permission: {
          userId,
          oldLevel,
          newLevel: null
        }
      }
    });

    return true;
  }

  /**
   * Update a user's permission level for a page
   */
  public async updatePermission(
    pageId: Types.ObjectId,
    userId: Types.ObjectId,
    newLevel: PermissionLevel,
    updatedBy: Types.ObjectId
  ): Promise<IShareSetting | null> {
    // Check if updater has admin permission
    const hasAdminPermission = await this.hasPermission(
      pageId,
      updatedBy,
      PermissionLevel.ADMIN
    );

    if (!hasAdminPermission) {
      throw new Error('Insufficient permissions to update access');
    }

    const sharing = await PageSharing.findOne({ pageId });
    if (!sharing) {
      throw new Error('Page not found');
    }

    // Find and update permission
    const existingSetting = sharing.shareSettings.find(
      setting => setting.userId.equals(userId)
    );

    if (!existingSetting) {
      return null;
    }

    const oldLevel = existingSetting.permissionLevel;
    existingSetting.permissionLevel = newLevel;
    existingSetting.lastModified = new Date();
    await sharing.save();

    // Record in change history
    await ChangeHistory.create({
      pageId,
      userId: updatedBy,
      type: ChangeType.PERMISSION,
      timestamp: new Date(),
      metadata: {
        permission: {
          userId,
          oldLevel,
          newLevel
        }
      }
    });

    return existingSetting;
  }

  /**
   * Get all users with access to a page
   */
  public async getPageUsers(pageId: Types.ObjectId): Promise<IShareSetting[]> {
    const sharing = await PageSharing.findOne({ pageId })
      .populate('shareSettings.userId', 'name email avatar')
      .populate('shareSettings.addedBy', 'name');

    return sharing ? sharing.shareSettings : [];
  }

  /**
   * Make a page public or private
   */
  public async setPageVisibility(
    pageId: Types.ObjectId,
    isPublic: boolean,
    updatedBy: Types.ObjectId
  ): Promise<boolean> {
    // Check if user has admin permission
    const hasAdminPermission = await this.hasPermission(
      pageId,
      updatedBy,
      PermissionLevel.ADMIN
    );

    if (!hasAdminPermission) {
      throw new Error('Insufficient permissions to change page visibility');
    }

    const sharing = await PageSharing.findOne({ pageId });
    if (!sharing) {
      throw new Error('Page not found');
    }

    sharing.isPublic = isPublic;
    await sharing.save();

    return true;
  }
} 