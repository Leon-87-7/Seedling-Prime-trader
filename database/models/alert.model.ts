import {
  Schema,
  model,
  models,
  type Document,
  type Model,
} from 'mongoose';

export type AlertType = 'price_upper' | 'price_lower' | 'volume';

export interface AlertItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  alertType: AlertType;
  targetPrice?: number;
  volumeMultiplier?: number;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<AlertItem>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    alertType: {
      type: String,
      required: true,
      enum: ['price_upper', 'price_lower', 'volume'],
    },
    targetPrice: {
      type: Number,
      required: function (this: AlertItem) {
        return (
          this.alertType === 'price_upper' ||
          this.alertType === 'price_lower'
        );
      },
    },
    volumeMultiplier: {
      type: Number,
      required: function (this: AlertItem) {
        return this.alertType === 'volume';
      },
      default: 2.0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isTriggered: {
      type: Boolean,
      default: false,
      index: true,
    },
    triggeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
AlertSchema.index({ userId: 1, symbol: 1 });
AlertSchema.index({ isActive: 1, isTriggered: 1 });

const Alert: Model<AlertItem> =
  (models?.Alert as Model<AlertItem>) ||
  model<AlertItem>('Alert', AlertSchema);

export default Alert;
