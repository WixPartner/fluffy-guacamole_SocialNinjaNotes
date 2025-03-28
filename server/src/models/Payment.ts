import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  paymentMethod: {
    type: string;
    last4: string;
    brand?: string;
  };
  billingPeriod: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stripeCustomerId: {
    type: String,
    required: true,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    index: true
  },
  stripeInvoiceId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['succeeded', 'failed', 'pending'],
    default: 'pending'
  },
  paymentMethod: {
    type: {
      type: String,
      required: true
    },
    last4: {
      type: String,
      required: true
    },
    brand: String
  },
  billingPeriod: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes for common queries
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'billingPeriod.start': 1, 'billingPeriod.end': 1 });

export const Payment = model<IPayment>('Payment', paymentSchema); 