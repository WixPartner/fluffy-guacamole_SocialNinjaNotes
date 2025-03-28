import { Schema, model } from 'mongoose';

interface ITemplateSubscription {
  email: string;
  name: string;
  userId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const templateSubscriptionSchema = new Schema<ITemplateSubscription>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

export const TemplateSubscription = model<ITemplateSubscription>('TemplateSubscription', templateSubscriptionSchema);
export default TemplateSubscription; 