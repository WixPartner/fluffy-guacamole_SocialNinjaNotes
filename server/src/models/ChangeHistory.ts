import { Schema, model, Document, Types } from 'mongoose';

// Enums
export enum ChangeType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MOVE = 'move',
  PERMISSION = 'permission'
}

// Interfaces
export interface IChangeHistory extends Document {
  pageId: Types.ObjectId;
  blockId?: string;
  userId: Types.ObjectId;
  type: ChangeType;
  timestamp: Date;
  previousContent?: any;
  newContent?: any;
  metadata?: {
    position?: {
      from: number;
      to: number;
    };
    permission?: {
      userId: Types.ObjectId;
      oldLevel: string;
      newLevel: string;
    };
  };
}

// Schema
const ChangeHistorySchema = new Schema<IChangeHistory>({
  pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
  blockId: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: Object.values(ChangeType),
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  previousContent: Schema.Types.Mixed,
  newContent: Schema.Types.Mixed,
  metadata: {
    position: {
      from: Number,
      to: Number
    },
    permission: {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      oldLevel: String,
      newLevel: String
    }
  }
});

// Indexes
ChangeHistorySchema.index({ pageId: 1, timestamp: -1 });
ChangeHistorySchema.index({ userId: 1, timestamp: -1 });
ChangeHistorySchema.index({ blockId: 1, timestamp: -1 });

// Static methods
ChangeHistorySchema.statics.findByPage = async function(
  pageId: Types.ObjectId,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  } = {}
) {
  const query = this.find({ pageId });

  if (options.startDate) {
    query.gte('timestamp', options.startDate);
  }
  if (options.endDate) {
    query.lte('timestamp', options.endDate);
  }

  return query
    .populate('userId', 'name avatar')
    .sort({ timestamp: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 50);
};

ChangeHistorySchema.statics.findByBlock = async function(
  pageId: Types.ObjectId,
  blockId: string,
  options: {
    limit?: number;
    skip?: number;
  } = {}
) {
  return this.find({ pageId, blockId })
    .populate('userId', 'name avatar')
    .sort({ timestamp: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 20);
};

ChangeHistorySchema.statics.findByUser = async function(
  userId: Types.ObjectId,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  } = {}
) {
  const query = this.find({ userId });

  if (options.startDate) {
    query.gte('timestamp', options.startDate);
  }
  if (options.endDate) {
    query.lte('timestamp', options.endDate);
  }

  return query
    .populate('pageId', 'name')
    .sort({ timestamp: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 50);
};

// Methods
ChangeHistorySchema.methods.getDetails = function() {
  const details = {
    type: this.type,
    timestamp: this.timestamp,
    user: this.userId,
    page: this.pageId
  };

  switch (this.type) {
    case ChangeType.CREATE:
    case ChangeType.UPDATE:
      return {
        ...details,
        content: this.newContent
      };
    case ChangeType.DELETE:
      return {
        ...details,
        content: this.previousContent
      };
    case ChangeType.MOVE:
      return {
        ...details,
        from: this.metadata?.position?.from,
        to: this.metadata?.position?.to
      };
    case ChangeType.PERMISSION:
      return {
        ...details,
        permission: this.metadata?.permission
      };
    default:
      return details;
  }
};

// Export model
export const ChangeHistory = model<IChangeHistory>('ChangeHistory', ChangeHistorySchema); 