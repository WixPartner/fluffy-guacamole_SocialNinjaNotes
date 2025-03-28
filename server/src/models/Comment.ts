import { Schema, model, Document, Types } from 'mongoose';

// Interfaces
export interface IComment extends Document {
  pageId: Types.ObjectId;
  blockId: string;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  parentId?: Types.ObjectId;
  mentions: Types.ObjectId[];
  reactions: {
    userId: Types.ObjectId;
    type: string;
  }[];
  isEdited: boolean;
  position?: {
    startOffset: number;
    endOffset: number;
  };
}

interface IReaction {
  userId: Types.ObjectId;
  type: string;
}

// Schema
const CommentSchema = new Schema<IComment>({
  pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
  blockId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String }
  }],
  isEdited: { type: Boolean, default: false },
  position: {
    startOffset: { type: Number },
    endOffset: { type: Number }
  }
});

// Indexes
CommentSchema.index({ pageId: 1, blockId: 1 });
CommentSchema.index({ pageId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });

// Methods
CommentSchema.methods.resolve = async function(userId: Types.ObjectId) {
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  return this.save();
};

CommentSchema.methods.unresolve = async function() {
  this.resolvedAt = undefined;
  this.resolvedBy = undefined;
  return this.save();
};

CommentSchema.methods.addReaction = async function(userId: Types.ObjectId, type: string) {
  const existingReaction = this.reactions.find(
    (reaction: IReaction) => reaction.userId.equals(userId) && reaction.type === type
  );
  
  if (!existingReaction) {
    this.reactions.push({ userId, type });
    return this.save();
  }
  return this;
};

CommentSchema.methods.removeReaction = async function(userId: Types.ObjectId, type: string) {
  this.reactions = this.reactions.filter(
    (reaction: IReaction) => !(reaction.userId.equals(userId) && reaction.type === type)
  );
  return this.save();
};

// Middleware
CommentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.updatedAt = new Date();
    this.isEdited = true;
  }
  next();
});

// Static methods
CommentSchema.statics.findByPage = async function(pageId: Types.ObjectId) {
  return this.find({ pageId })
    .populate('userId', 'name avatar')
    .populate('resolvedBy', 'name')
    .populate('mentions', 'name')
    .sort({ createdAt: -1 });
};

CommentSchema.statics.findByBlock = async function(pageId: Types.ObjectId, blockId: string) {
  return this.find({ pageId, blockId })
    .populate('userId', 'name avatar')
    .populate('resolvedBy', 'name')
    .populate('mentions', 'name')
    .sort({ createdAt: -1 });
};

// Export model
export const Comment = model<IComment>('Comment', CommentSchema); 