import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUnavailabilityRequest extends Document {
  operator: mongoose.Types.ObjectId;
  dates: Date[];
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UnavailabilityRequestSchema: Schema = new Schema(
  {
    operator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dates: [{
      type: Date,
      required: true,
    }],
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
UnavailabilityRequestSchema.index({ operator: 1, status: 1 });
UnavailabilityRequestSchema.index({ dates: 1 });
UnavailabilityRequestSchema.index({ status: 1, createdAt: -1 });

const UnavailabilityRequest: Model<IUnavailabilityRequest> = 
  mongoose.models.UnavailabilityRequest || 
  mongoose.model<IUnavailabilityRequest>('UnavailabilityRequest', UnavailabilityRequestSchema);

export default UnavailabilityRequest;

