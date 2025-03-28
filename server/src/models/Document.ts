import { Schema, model, Document as MongoDocument, Types } from 'mongoose';

export interface IDocument extends MongoDocument {
  title: string;
  content: any;
  owner: Types.ObjectId;
  parent?: Types.ObjectId;
  workspace: Types.ObjectId;
  collaborators: Types.ObjectId[];
  permissions: {
    public: boolean;
    canEdit: Types.ObjectId[];
    canView: Types.ObjectId[];
  };
  icon?: string;
  coverImage?: string;
  tags: string[];
  lastModified: Date;
  createdAt: Date;
  isArchived: boolean;
  version: number;
  type: 'document' | 'database' | 'kanban' | 'calendar';
}

const documentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: Schema.Types.Mixed,
    default: {}
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  permissions: {
    public: {
      type: Boolean,
      default: false
    },
    canEdit: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    canView: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  icon: String,
  coverImage: String,
  tags: [String],
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    enum: ['document', 'database', 'kanban', 'calendar'],
    default: 'document'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
documentSchema.index({ title: 'text', tags: 'text' });
documentSchema.index({ workspace: 1, parent: 1 });
documentSchema.index({ owner: 1 });
documentSchema.index({ collaborators: 1 });

// Virtual populate for child documents
documentSchema.virtual('children', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save middleware to update lastModified
documentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

export const Document = model<IDocument>('Document', documentSchema); 