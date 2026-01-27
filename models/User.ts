import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'operator' | 'owner' | 'cleaner' | 'viewer';
  phone?: string;
  /** Operator-only: apartments this operator can work at. Empty/missing = all apartments. */
  assignedApartments?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'operator', 'owner', 'cleaner', 'viewer'],
      required: true,
    },
    phone: {
      type: String,
    },
    assignedApartments: [{
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
    }],
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

