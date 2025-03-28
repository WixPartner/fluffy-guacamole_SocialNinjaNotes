import { Schema, model, Document, Types } from 'mongoose';

// Enums
export enum PermissionLevel {
  VIEWER = 'viewer',
  COMMENTER = 'commenter',
  EDITOR = 'editor',
  ADMIN = 'admin'
}

// Interfaces
export interface IShareSetting extends Document {
  pageId: Types.ObjectId;
  userId: Types.ObjectId;
  permissionLevel: PermissionLevel;
  addedBy: Types.ObjectId;
  addedAt: Date;
  lastModified: Date;
}

export interface IPageSharing extends Document {
  pageId: Types.ObjectId;
  isPublic: boolean;
  allowComments: boolean;
  publicLink?: string;
  shareSettings: Types.DocumentArray<IShareSetting>;
  activeUsers: Types.ObjectId[];
  lastEditedBy: Types.ObjectId;
  lastEditedAt: Date;
}

// Schemas
const ShareSettingSchema = new Schema<IShareSetting>({
  pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  permissionLevel: {
    type: String,
    enum: Object.values(PermissionLevel),
    required: true,
    default: PermissionLevel.VIEWER
  },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now }
});

const PageSharingSchema = new Schema<IPageSharing>({
  pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true, unique: true },
  isPublic: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  publicLink: { type: String },
  shareSettings: [ShareSettingSchema],
  activeUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  lastEditedAt: { type: Date, default: Date.now }
});

// Indexes
ShareSettingSchema.index({ pageId: 1, userId: 1 }, { unique: true });
PageSharingSchema.index({ pageId: 1 }, { unique: true });
PageSharingSchema.index({ publicLink: 1 }, { sparse: true });

// Methods
ShareSettingSchema.methods.updatePermission = async function(newPermissionLevel: PermissionLevel) {
  this.permissionLevel = newPermissionLevel;
  this.lastModified = new Date();
  return this.save();
};

PageSharingSchema.methods.addShareSetting = async function(shareSetting: IShareSetting) {
  this.shareSettings.push(shareSetting);
  return this.save();
};

PageSharingSchema.methods.removeShareSetting = async function(userId: Types.ObjectId) {
  this.shareSettings = this.shareSettings.filter(
    (setting: IShareSetting) => !setting.userId.equals(userId)
  );
  return this.save();
};

// Export models
export const ShareSetting = model<IShareSetting>('ShareSetting', ShareSettingSchema);
export const PageSharing = model<IPageSharing>('PageSharing', PageSharingSchema); 