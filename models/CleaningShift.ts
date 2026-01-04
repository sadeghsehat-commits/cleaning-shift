import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICleaningShift extends Document {
  apartment: mongoose.Types.ObjectId;
  cleaner: mongoose.Types.ObjectId;
  scheduledDate: Date;
  scheduledStartTime: Date;
  scheduledEndTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  confirmedSeen?: {
    confirmed: boolean;
    confirmedAt?: Date;
  };
  timeChangeRequest?: {
    requestedBy: mongoose.Types.ObjectId;
    newStartTime?: Date;
    newEndTime?: Date;
    newApartment?: mongoose.Types.ObjectId;
    newCleaner?: mongoose.Types.ObjectId;
    newScheduledDate?: Date;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'operator_confirmed' | 'operator_rejected';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    operatorConfirmed?: boolean;
    operatorConfirmedAt?: Date;
  };
  problems?: Array<{
    reportedBy: mongoose.Types.ObjectId;
    reportedAt: Date;
    description: string;
    type: 'issue' | 'forgotten_item';
    resolved: boolean;
    resolvedAt?: Date;
    photos?: Array<{
      url: string; // base64 or URL
      uploadedAt: Date;
    }>;
  }>;
  instructionPhotos?: Array<{
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    url: string; // base64 or URL
    description?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CleaningShiftSchema: Schema = new Schema(
  {
    apartment: {
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
    },
    cleaner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledStartTime: {
      type: Date,
      required: true,
    },
    scheduledEndTime: {
      type: Date,
    },
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    confirmedSeen: {
      confirmed: {
        type: Boolean,
        default: false,
      },
      confirmedAt: {
        type: Date,
      },
    },
    timeChangeRequest: {
      requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      newStartTime: Date,
      newEndTime: Date,
      newApartment: {
        type: Schema.Types.ObjectId,
        ref: 'Apartment',
      },
      newCleaner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      newScheduledDate: Date,
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'operator_confirmed', 'operator_rejected'],
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
      operatorConfirmed: {
        type: Boolean,
        default: false,
      },
      operatorConfirmedAt: Date,
    },
    problems: [
      {
        reportedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        description: String,
        type: {
          type: String,
          enum: ['issue', 'forgotten_item'],
        },
        resolved: {
          type: Boolean,
          default: false,
        },
        resolvedAt: Date,
        photos: [
          {
            url: String,
            uploadedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    instructionPhotos: [
      {
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        url: String,
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes for frequently queried fields
CleaningShiftSchema.index({ cleaner: 1, scheduledDate: 1 });
CleaningShiftSchema.index({ apartment: 1, scheduledDate: 1 });
CleaningShiftSchema.index({ scheduledDate: 1, scheduledStartTime: 1 });
CleaningShiftSchema.index({ status: 1, scheduledDate: 1 });
CleaningShiftSchema.index({ createdAt: -1 });

const CleaningShift: Model<ICleaningShift> = mongoose.models.CleaningShift || mongoose.model<ICleaningShift>('CleaningShift', CleaningShiftSchema);

export default CleaningShift;

