import mongoose, { Document, Schema } from 'mongoose';

/**
 * PushToken Model
 * 
 * Stores FCM/APNS tokens for sending native push notifications to mobile devices.
 * This is used instead of Web Push subscriptions for Capacitor apps.
 */
export interface IPushToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;           // FCM token (Android) or APNS token (iOS)
  platform: string;        // 'ios', 'android', or 'unknown'
  createdAt: Date;
  updatedAt: Date;
}

const PushTokenSchema = new Schema<IPushToken>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true,
  },
  token: { 
    type: String, 
    required: true,
    unique: true,
    index: true,
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'unknown'],
    default: 'unknown',
  },
}, {
  timestamps: true,
});

// Create compound index for efficient queries
PushTokenSchema.index({ user: 1, token: 1 });

export default mongoose.models.PushToken || mongoose.model<IPushToken>('PushToken', PushTokenSchema);

