import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'shift_assigned' | 'time_change_request' | 'time_change_approved' | 'time_change_rejected' | 'problem_reported' | 'shift_confirmed' | 'time_change_requested_by_admin' | 'time_change_confirmed_by_operator' | 'shift_time_changed' | 'instruction_photo_added' | 'calendar_updated' | 'calendar_updated_new_days' | 'shift_deleted' | 'unavailability_request' | 'unavailability_request_reviewed';
  title: string;
  message: string;
  relatedShift?: mongoose.Types.ObjectId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['shift_assigned', 'time_change_request', 'time_change_approved', 'time_change_rejected', 'problem_reported', 'shift_confirmed', 'time_change_requested_by_admin', 'time_change_confirmed_by_operator', 'shift_time_changed', 'instruction_photo_added', 'calendar_updated', 'calendar_updated_new_days', 'shift_deleted', 'unavailability_request', 'unavailability_request_reviewed'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedShift: {
      type: Schema.Types.ObjectId,
      ref: 'CleaningShift',
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for frequently queried fields
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, read: 1, readAt: 1 });
NotificationSchema.index({ relatedShift: 1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

