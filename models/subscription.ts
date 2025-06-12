import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISubscription extends Document {
  planName: any;
  level: string; // Generic string, no predefined levels
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentId?: string;
}

const SubscriptionSchema: Schema = new Schema(
  {
    level: {
      type: String, // Removed enum constraint
      default: 'free', // Optional: You can keep or remove this default
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },
    paymentId: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

export default Subscription;
