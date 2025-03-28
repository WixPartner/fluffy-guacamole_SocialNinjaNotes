import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId;
  members: {
    user: Types.ObjectId;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  }[];
  icon?: string;
  settings: {
    defaultDocumentPermission: 'private' | 'workspace' | 'public';
    allowPublicLinks: boolean;
    allowGuestAccess: boolean;
  };
  createdAt: Date;
  isArchived: boolean;
}

const workspaceSchema = new Schema<IWorkspace>({
  name: {
    type: String,
    required: [true, 'Please add a workspace name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    }
  }],
  icon: String,
  settings: {
    defaultDocumentPermission: {
      type: String,
      enum: ['private', 'workspace', 'public'],
      default: 'workspace'
    },
    allowPublicLinks: {
      type: Boolean,
      default: true
    },
    allowGuestAccess: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
workspaceSchema.index({ name: 'text' });
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

// Virtual populate for documents in workspace
workspaceSchema.virtual('documents', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'workspace'
});

// Pre-save middleware to ensure owner is also a member
workspaceSchema.pre('save', function(next) {
  const ownerMember = this.members.find(
    member => member.user.toString() === this.owner.toString()
  );
  
  if (!ownerMember) {
    this.members.push({
      user: this.owner,
      role: 'owner'
    });
  }
  next();
});

export const Workspace = model<IWorkspace>('Workspace', workspaceSchema); 