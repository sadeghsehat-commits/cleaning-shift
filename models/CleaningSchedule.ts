import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICleaningSchedule extends Document {
  apartment: mongoose.Types.ObjectId;
  year: number;
  month: number; // 1-12
  days: number[]; // Array of day numbers (1-31) - kept for backward compatibility
  scheduledDays: Array<{
    day: number; // 1-31
    guestCount: number; // Number of guests to prepare for
  }>; // Kept for backward compatibility
  bookings: Array<{
    checkIn: Date; // Check-in date
    checkOut: Date; // Check-out date
    guestCount: number; // Number of guests
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CleaningScheduleSchema: Schema = new Schema(
  {
    apartment: {
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    days: {
      type: [Number],
      required: false, // Optional for backward compatibility
      validate: {
        validator: function(days: number[]) {
          if (!days || days.length === 0) return true;
          return days.every(day => day >= 1 && day <= 31);
        },
        message: 'Days must be between 1 and 31',
      },
    },
    scheduledDays: {
      type: [{
        day: {
          type: Number,
          required: true,
          min: 1,
          max: 31,
        },
        guestCount: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      }],
      required: false,
    },
    bookings: {
      type: [{
        checkIn: {
          type: Date,
          required: true,
        },
        checkOut: {
          type: Date,
          required: true,
        },
        guestCount: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      }],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per apartment/year/month
CleaningScheduleSchema.index({ apartment: 1, year: 1, month: 1 }, { unique: true });

const CleaningSchedule: Model<ICleaningSchedule> = 
  mongoose.models.CleaningSchedule || 
  mongoose.model<ICleaningSchedule>('CleaningSchedule', CleaningScheduleSchema);

export default CleaningSchedule;

