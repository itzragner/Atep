import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'organizer' | 'participant';
  fullName: string;
  points: number;
  workshopsRegistered: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true, // ✅ Keep this
      lowercase: true,
      trim: true,
      // ❌ REMOVE: index: true (this causes the duplicate index warning)
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'organizer', 'participant'],
      default: 'participant',
    },
    fullName: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    workshopsRegistered: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Workshop',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ✅ Indexes - these are fine
UserSchema.index({ role: 1 });
// ❌ REMOVE this line to avoid duplicate: UserSchema.index({ email: 1 });

// ✅ Prevent model overwrite error
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;