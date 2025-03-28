import { Schema, model } from 'mongoose';

export interface TableCell {
  id: string;
  content: string;
}

export interface TableRow {
  id: string;
  cells: TableCell[];
  columnWidths?: number[];
}

export interface Block {
  id: string;
  type: 'text' | 'bullet-list' | 'number-list' | 'todo-list' | 'toggle-list' | 'heading1' | 'heading2' | 'heading3' | 'table' | 'schedule' | 'picture' | 'code' | 'equation' | 'file';
  content: string;
  checked?: boolean;
  toggleContent?: Block[];
  title?: string;
  rows?: TableRow[];
  columns?: number;
  language?: string;
  mathMode?: 'inline' | 'display';  // For equation blocks
  latex?: string;  // Raw LaTeX content
  // File block properties
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileKey?: string;  // S3 key
  downloadUrl?: string;  // Presigned URL
}

interface IPage {
  name: string;
  path: string;
  icon?: string;
  blocks?: Block[];
  userId: Schema.Types.ObjectId;
  order: number;
  isDeleted: boolean;
  deletedAt?: Date;
  lastEditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blockSchema = new Schema<Block>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'bullet-list', 'number-list', 'todo-list', 'toggle-list', 'heading1', 'heading2', 'heading3', 'table', 'schedule', 'picture', 'code', 'equation', 'file']
  },
  content: { 
    type: String, 
    required: function(this: Block) {
      return this.type !== 'table' && this.type !== 'schedule' && this.type !== 'equation' && this.type !== 'file';
    },
    default: ''
  },
  checked: { type: Boolean },
  toggleContent: [{ type: Schema.Types.Mixed }],
  title: { type: String },
  rows: [{
    id: { type: String, required: true },
    cells: [{
      id: { type: String, required: true },
      content: { type: String, default: '' }
    }],
    columnWidths: [{ type: Number }]
  }],
  columns: { type: Number },
  language: { type: String },
  mathMode: { 
    type: String, 
    enum: ['inline', 'display'],
    default: 'display'
  },
  latex: { type: String },
  // Add file block properties to schema
  fileName: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  fileKey: { type: String },
  downloadUrl: { type: String }
});

const pageSchema = new Schema<IPage>({
  name: { type: String, required: true },
  path: { type: String, required: true },
  icon: { type: String },
  blocks: [blockSchema],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  lastEditedAt: { type: Date }
}, {
  timestamps: true
});

// Create compound index for userId and path to ensure unique paths per user
pageSchema.index({ userId: 1, path: 1 }, { unique: true });

export const Page = model<IPage>('Page', pageSchema); 